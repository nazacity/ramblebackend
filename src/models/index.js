'use strict';

const mongoose = require('mongoose');
const config = require('../utils/config');

mongoose.connect(config.mongo.URL, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

module.exports = {
  Activity: require('./activity'),
  EmergencyContact: require('./emergency_contact'),
  Employee: require('./employee'),
  Partner: require('./partner'),
  User: require('./user'),
  UserActivity: require('./user_activity'),
  UserPost: require('./user_post'),
  UserYearRecord: require('./user_year_record'),
  Address: require('./address'),
};
