'use strict';

const _ = require('lodash');
const config = require('../utils/config');
const models = require('../models');

const services = {
  RecruitService: require('./recruit'),
  MilitaryBaseService: require('./military_base'),
  UserService: require('./user'),
  FormService: require('./form')
};

_.forEach(services, (service, key) => {
  services[key] = new service(models, services, config);
});

module.exports = services;
