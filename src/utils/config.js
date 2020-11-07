'use strict';

const config = {
  port: process.env.SERVER_PORT || '5000',
  mongo: {
    URL: process.env.MONGO_URL || 'mongodb://localhost:27017'
  },
  jwt: {
    issuer: process.env.JWT_ISSUER || 'boom',
    secret: process.env.JWT_SECRET || 'communication12'
  }
}

module.exports = config;