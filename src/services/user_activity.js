'use strict';

const AbstractService = require('./abstract');

class UserActivityService extends AbstractService {
  listUserActivities(filter, skip, limit) {
    return this.models.UserActivity.find(filter).skip(skip).limit(limit);
  }

  findById(id) {
    return this.models.UserActivity.findById(id);
  }

  async updateCheckedin(id) {
    return this.models.UserActivity.findByIdAndUpdate(
      id,
      {
        $set: {
          state: 'checked_in',
        },
      },
      {
        new: true,
      }
    );
  }

  async updateCheckedOut(id) {
    const user_activities = await this.models.UserActivity.findById(
      id
    ).populate({ path: 'activity.id' });

    const { coupons } = user_activities.activity.id;

    return this.models.UserActivity.findByIdAndUpdate(id, {
      $set: {
        state: 'finished',
        coupons: coupons,
      },
    });
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
