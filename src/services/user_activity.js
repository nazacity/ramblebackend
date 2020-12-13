'use strict';

const AbstractService = require('./abstract');

class UserActivityService extends AbstractService {
  listUserActivities(filter, skip, limit) {
    return this.models.UserActivity.find(filter).skip(skip).limit(limit);
  }

  findById(id) {
    return this.models.UserActivity.findById(id);
  }

  async createUserActivity(data) {
    return this.models.UserActivity.create(data);
  }

  async editUserActivity(id, data) {
    return this.models.UserActivity.findOneAndUpdate(
      { _id: id },
      {
        $set: data,
      }
    );
  }
}

module.exports = UserActivityService;
