'use strict';

const mongoose = require('mongoose');
const config = require('../utils/config');

mongoose.connect(config.mongo.URL, {useNewUrlParser: true});

module.exports = {
  MilitaryBase: require('./military_base'),
  Recruit: require('./recruit'),
  User: require('./user'),
  Form: require('./form'),
  FormRecruit: require('./formRecruit')
};
