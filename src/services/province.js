'use strict';

const AbstractService = require('./abstract');

class ProvinceService extends AbstractService {
  async getAll () {
    return this.models.Province.find();
  }

  async getRegion (provinceId) {
    return this.models.Region.find({
      provinceId
    });
  }
}

module.exports = ProvinceService;
