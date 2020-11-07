'use strict';

class AbstractService {
  constructor (models, services, config) {
    this.models = models;
    this.services = services;
    this.config = config;
    this.initialize();
  }

  initialize () {}
}

module.exports = AbstractService;
