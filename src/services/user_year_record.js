'use strict';

const AbstractService = require('./abstract');
const { times } = require('lodash');

class UserYearRecordService extends AbstractService {
  listUserYearRecords(filter, skip, limit) {
    return this.models.UserPost.find(filter).skip(skip).limit(limit);
  }

  findById(id) {
    return this.models.UserYearRecord.findById(id);
  }

  async createUserYearRecord(data) {
    return this.models.UserYearRecord.create(data);
  }

  async editUserYearRecord(id, data) {
    return this.models.UserYearRecord.findOneAndUpdate(
      { _id: id },
      {
        ...data,
      }
    );
  }

  async updateUserYearRecord(userId, distance) {
    console.log('test', distance);
    let userYearRecord;
    userYearRecord = await this.models.UserYearRecord.findOneAndUpdate(
      {
        user: userId,
        year: new Date().getFullYear(),
      },
      { upsert: true }
    );

    if (!userYearRecord) {
      userYearRecord = await this.models.UserYearRecord.create({
        user: userId,
        activity_number: 1,
        distance: distance,
        time_hr: 0,
        time_min: 0,
        average: 0,
      });
      return userYearRecord;
    } else {
      const newDistance = userYearRecord.distance + distance;
      const newActivityNumber = userYearRecord.activity_number + 1;

      return this.models.UserYearRecord.findByIdAndUpdate(userYearRecord._id, {
        $set: {
          activity_number: newActivityNumber,
          distance: newDistance,
        },
        new: true,
      });
    }
  }
}

module.exports = UserYearRecordService;
