'use strict';

const AbstractService = require('./abstract');

class MainAdvertizeService extends AbstractService {
  async createAdvertize(data) {
    return this.models.MainAdvertize.create(data);
  }

  async getMainAdvertizes() {
    return this.models.MainAdvertize.find();
  }
}

module.exports = MainAdvertizeService;
