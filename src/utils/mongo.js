'use strict';

'use stirct';

const mongoose = require('mongoose');
const config = require('./config');

module.exports = {
  waitForDBConnection: new Promise((resolve, reject) => {
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
  })
};
