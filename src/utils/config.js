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
    billerId: '041031474109502',
    key: 'l7d1103e09fe5e49b2b0fc22b42f604fdf',
    secret: '96d19247927c4b1d804b8c2d0d09b003', // sandbox
    // billerId: '010556400829301',
    // key: 'l743a7baaa29a84cb8a907c39c3512395c',
    // secret: '3d0c99dd9fda4ae3a3fb85adcb3b60e8', // production
  },
  onesignal: {
    app_id: 'a7cc39f9-5233-46a8-9bec-cb87d2c34b5d',
    rest_api_key: 'MWY4OTM0ZmEtMTE2NS00YWNhLWJiN2UtMmUwNmQzZmEyODFm',
  },
  line: {
    message_api: 'https://api.line.me/v2/bot/message',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer +uniMVPzDtJP6aWzmxYkYOUpzXjtaiezdLDeOEpbOfGRSSFgmOMY7VOYy/AoxKzfxjvhrP4kSVzEaYwms/lTC+IIp6BlBSHcwlkGwLRlH70irpG8o6+RVQM4pxm/oKjCVesV4vLhdKRfhjRDfQvSLQdB04t89/1O/w1cDnyilFU=`,
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
