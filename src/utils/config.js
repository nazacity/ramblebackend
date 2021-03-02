'use strict';

require('dotenv').config();
const AWS = require('aws-sdk');

const config = {
  port: process.env.SERVER_PORT || '5000',
  mongo: {
    URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
  },
  social: {
    URL: process.env.SOCIAL_URL || 'http://localhost:5100',
  },
  jwt: {
    issuer: process.env.JWT_ISSUER || 'ramble',
    secret: process.env.JWT_SECRET || 'ramblemarathon',
  },
  scb: {
    // billerId: '041031474109502',
    // key: 'l7d1103e09fe5e49b2b0fc22b42f604fdf',
    // secret: '96d19247927c4b1d804b8c2d0d09b003', // sandbox
    billerId: '311040039475180',
    key: 'l73fe780a65b8747e3bb3865c559d20564',
    secret: '0fda3ada921845cd9d1635adde8e58ee',
  },
  onesignal: {
    app_id: 'a7cc39f9-5233-46a8-9bec-cb87d2c34b5d',
    rest_api_key: 'MWY4OTM0ZmEtMTE2NS00YWNhLWJiN2UtMmUwNmQzZmEyODFm',
  },
  line: {
    message_api: 'https://api.line.me/v2/bot/message',
    line_header: {
      'Content-Type': 'application/json',
      Authorization: `Bearer hT3PdJDVY/oOycNSdzNGbQMHRtLyfTpw/E9G/66wgmMJhNlfBaqNM1HH2EgXz/ErH/NbNo3vxM0SH+AjUFFM7yCE5FA7g3Evr4sxy/sSPzqNPnWftduPoIxl0gMVSbTQ/KKz2IdZnZNlhBnJWtABYQdB04t89/1O/w1cDnyilFU=`,
    },
  },
  S3: new AWS.S3({
    accessKeyId: 'PU4JXRL3KG6ABV3CHQNS',
    secretAccessKey: 'x6oK8C50E97X5BImp5KkHzww/c9f8xFE+1jQr4r6NS4',
    region: 'nyc3',
    endpoint: `nyc3.digitaloceanspaces.com`,
    signatureVersion: 'v4',
  }),
};

module.exports = config;
