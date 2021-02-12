'use strict';

// ก่อนlanuch express-rate-limit สำหรับป้องกันการยิงรีเควสมากๆ
// Mo

const express = require('express');
const helmet = require('helmet');
const xssFilter = require('x-xss-protection');
const cors = require('cors');

const passport = require('./passport');
const config = require('./utils/config');
const { waitForDBConnection } = require('./utils/mongo');
require('./utils/schedule');
const { upload } = require('./utils/spacesutil');

require('./models');
const app = express();

// security
app.use(helmet());
app.use(xssFilter());
app.use(cors());

app.use(express.json());
app.use(passport.initialize());

const createServer = async () => {
  await waitForDBConnection;
  console.info('Server Initialized!');

  // Line
  app.use('/api/line', require('./routes/linebot'));

  // Everyone
  app.use('/api/everyone', require('./routes/everyone'));

  // User Routes
  app.use(
    '/users/login',
    passport.authenticate('user'),
    require('./routes/users/login')
  );
  app.use(
    '/users/lineId',
    passport.authenticate('userLineId'),
    require('./routes/users/login')
  );
  app.use(
    '/users/appleId',
    passport.authenticate('userAppleId'),
    require('./routes/users/login')
  );
  app.use(
    '/api/users',
    passport.authenticate('userJwt'),
    require('./routes/users')
  );

  // Employee Routes
  app.use(
    '/employees/login',
    passport.authenticate('employee'),
    require('./routes/employees/login')
  );
  app.use(
    '/api/employees',
    passport.authenticate('employeeJwt'),
    require('./routes/employees')
  );

  // Partner Routes
  app.use(
    '/partners/login',
    passport.authenticate('partner'),
    require('./routes/partners/login')
  );
  app.use(
    '/api/partners',
    passport.authenticate('partnerJwt'),
    require('./routes/partners')
  );

  const extractToken = (headers) => {
    if (/Bearer\s.+/.test(headers.secretkey)) {
      return headers.secretkey.substring(7);
    } else {
      return null;
    }
  };

  app.post('/upload', function (req, res, next) {
    const secrekey = extractToken(req.headers);

    if (
      secrekey !==
      '13da72fc78074341e307064b6f68c951d0a2ffadb8c0f4a91575dfc73ea49e11'
    ) {
      return res.status(400).json({ data: 'Something went wrong' });
    } else {
      upload(req, res, function (error) {
        if (error) {
          console.log(error);
          return res.status(400).json({ data: 'Something went wrong' });
        } else {
          return res.status(200).json({ data: 'File uploaded successfully' });
        }
      });
    }
  });

  app.listen(config.port);
  console.info(`Server is listening on port ${config.port}`);
};

createServer();
