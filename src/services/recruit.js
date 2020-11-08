'use strict';

const AbstractService = require('./abstract');

class RecruitService extends AbstractService {
  get (id) {
    return this.models.Recruit.findById(id);
  }

  create (data) {
    data.bmi = this._getBMI(data.weight, data.height);
    return this.models.Recruit.create(data);
  }

  list (filter, skip, limit) {
    return this.models.Recruit.find(filter).skip(skip).limit(limit);
  }

  _getBMI (weight, height) {
    return weight * 100 * 100 / height / height;
  }
}

module.exports = RecruitService;
