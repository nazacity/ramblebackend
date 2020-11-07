'use strict';

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const xssFilter = require('x-xss-protection')
const cors = require('cors')

const config = require('./utils/config');

require('./models');

const app = express();

// security
app.use(helmet());
app.use(xssFilter());
app.use(cors());

app.use(express.json()); 

const initializeServer = (resolve, reject) => {
  console.info('Waiting for database connection ...');

  // mongoDB connection
  mongoose.connection.on('reconnected', function() {
    console.warn('MongoDB reconnected!');
  });
  mongoose.connection.on('disconnected', function() {
    console.warn('Database disconnected!');
    reject();
  });
  mongoose.connection.on('connected', function() {
    console.info(`Database connection ${config.mongo.URL} initiated!`);
    resolve();
  });
}

const createServer = async () => {
  await new Promise((resolve, reject) => {
    initializeServer(resolve, reject);
  })

  console.info('Server Initialized!');
  app.use('/provinces', require('./routes/provinces'));
  // app.use('/recruits', require('./routes/recruits'));
  app.use('/militarybases', require('./routes/military_bases'));

  app.listen(config.port)
  console.info(`Server is listening on port ${config.port}`)
}

createServer();