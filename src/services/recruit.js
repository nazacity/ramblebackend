'use strict';

const { filter } = require('lodash');
const AbstractService = require('./abstract');
const bmi = require('../utils/constants/bmi_group').constant;

class RecruitService extends AbstractService {
  get (id) {
    return this.models.Recruit.findOne({ _id: id }).populate('base').populate('trainingBase');
  }

  create (data) {
    data.bmi = this._getBMI(data.weight, data.height);

    if (data.bmi < 22.9) {
      data.bmiGroup = bmi.AVERAGE;
    } else if (data.bmi < 25) {
      data.bmiGroup = bmi.OVER_AVERAGE;
    } else {
      data.bmiGroup = bmi.OVER_WEIGHT;
    }

    return this.models.Recruit.create(data);
  }

  count (filters, fieldOfInterest) {
    if (filters.firstName) {
      filters.firstName = new RegExp(`^${filters.firstName}`);
    }
    if (filters.lastName) {
      filters.lastName = new RegExp(`^${filters.lastName}`);
    }

    return this.models.Recruit.aggregate([
      { $match: filters },
      { $group: { _id: `$${fieldOfInterest}`, count: { $sum: 1 } } } 
    ]);
  }

  list (filters, skip, limit) {
    if (filters.firstName) {
      filters.firstName = new RegExp(`^${filters.firstName}`);
    }
    if (filters.lastName) {
      filters.lastName = new RegExp(`^${filters.lastName}`);
    }
    return this.models.Recruit.find(filters).skip(skip).limit(limit).populate('base').populate('trainingBase');
  }

  _getBMI (weight, height) {
    return weight * 100 * 100 / height / height;
  }
}

module.exports = RecruitService;
