'use strict';

const AbstractService = require('./abstract');

class RecruitService extends AbstractService {
  create (data) {
    bmi = this._getBMI(data.weight, data.height);
    this.models.Recruit.create(data);
  }

  list (filter, skip, limit) {
    
  }

  _getBMI (weight, height) {
    return weight / height / height;
  }
}

module.exports = RecruitService;
