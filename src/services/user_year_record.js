'use strict';

const AbstractService = require('./abstract');

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
}

module.exports = UserYearRecordService;
