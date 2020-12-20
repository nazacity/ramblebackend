'use strict';

// ก่อนlanuch express-rate-limit สำหรับป้องกันการยิงรีเควสมากๆ
// Mo

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const xssFilter = require('x-xss-protection');
const cors = require('cors');

const passport = require('./passport');
const config = require('./utils/config');
const { waitForDBConnection } = require('./utils/mongo');
// const { job } = require('./utils/schedule');

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

  // User Routes
  app.use(
    '/users/login',
    passport.authenticate('user'),
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

  app.listen(config.port);
  console.info(`Server is listening on port ${config.port}`);
};

createServer();
