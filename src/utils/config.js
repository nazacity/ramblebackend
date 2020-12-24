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
    key: 'l7d1103e09fe5e49b2b0fc22b42f604fdf',
    secret: '96d19247927c4b1d804b8c2d0d09b003',
  },
  onesignal: {
    app_id: 'a7cc39f9-5233-46a8-9bec-cb87d2c34b5d',
    rest_api_key: 'MWY4OTM0ZmEtMTE2NS00YWNhLWJiN2UtMmUwNmQzZmEyODFm',
  },
};

module.exports = config;
