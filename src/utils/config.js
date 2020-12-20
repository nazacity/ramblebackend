'use strict';

require('dotenv').config();

const config = {
  port: process.env.SERVER_PORT || '5000',
  mongo: {
    URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
  },
  jwt: {
    issuer: process.env.JWT_ISSUER || 'ramble',
    secret: process.env.JWT_SECRET || 'ramblemarathon',
  },
  scb: {
    key: process.env.SCB_APIKEY || 'l7c5426aca730f4d69bae871b63b07be40',
    secret: process.env.SCB_SECRETKEY || 'ff22821fb914463e89451f904d253a1e',
  },
};

module.exports = config;
