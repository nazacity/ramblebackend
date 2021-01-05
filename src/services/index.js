'use strict';

const _ = require('lodash');
const config = require('../utils/config');
const models = require('../models');

const services = {
  ActivityService: require('./activity'),
  EmergencyContactService: require('./emergency_contact'),
  EmployeeService: require('./employee'),
  PartnerService: require('./partner'),
  UserService: require('./user'),
  UserActivityService: require('./user_activity'),
  UserPostService: require('./user_post'),
  AddressService: require('./address'),
  MainAdvertizeService: require('./mainadvertize'),
  OnboardingService: require('./onboarding'),
  UserYearRecordService: require('./user_year_record'),
};

_.forEach(services, (service, key) => {
  services[key] = new service(models, services, config);
});

module.exports = services;
