'use strict';

const config = {
  port: process.env.SERVER_PORT || '3000',
  mongo: {
    URL: process.env.MONGO_URL || 'mongodb://localhost:27017'
  }
}

module.exports = config;