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
        user_record: {
          distance: user_activities.activity.course.range,
        },
      },
      new: true,
    });
  }

  async updateUserPost(id, newUserPostId) {
    return this.models.UserActivity.findByIdAndUpdate(id, {
      $set: {
        user_post: newUserPostId,
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
      },
      {
        new: true,
      }
    );
  }

  async useCoupon(id, couponId) {
    const user_activity = await this.models.UserActivity.findById(id);

    const coupons = user_activity.coupons.map((item) => {
      if (item._id.toString() === couponId) {
        item.state = true;
        return item;
      }
      return item;
    });

    if (coupons.every((item) => item.state)) {
      return this.models.UserActivity.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            coupons: coupons,
            state: 'history',
          },
        },
        {
          new: true,
        }
      ).populate({ path: 'activity.id' });
    } else {
      return this.models.UserActivity.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            coupons: coupons,
          },
        },
        {
          new: true,
        }
      ).populate({ path: 'activity.id' });
    }
  }
}

module.exports = UserActivityService;
