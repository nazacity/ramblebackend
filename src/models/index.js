'use strict';

const mongoose = require('mongoose');
const config = require('../utils/config');

mongoose.connect(config.mongo.URL, {useNewUrlParser: true});

module.exports = {
  MilitaryBase: require('./military_base'),
  Province: require('./province'),
  Region: require('./region'),
  Recruit: require('./recruit')
};
