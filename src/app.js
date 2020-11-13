'use strict';

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const xssFilter = require('x-xss-protection')
const cors = require('cors')

const passport = require('./passport');
const config = require('./utils/config');
const { waitForDBConnection } = require('./utils/mongo');

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

  app.use('/login', passport.authenticate('local'), require('./routes/login'));
  app.use('/api/forms', passport.authenticate('jwt'), require('./routes/forms'));
  app.use('/api/provinces', require('./routes/provinces'));
  app.use('/api/recruits', passport.authenticate('jwt'), require('./routes/recruits'));
  app.use('/api/users', passport.authenticate('jwt'), require('./routes/users'));
  app.use('/api/militarybases', passport.authenticate('jwt'), require('./routes/military_bases'));

  app.listen(config.port)
  console.info(`Server is listening on port ${config.port}`)
}

createServer();
