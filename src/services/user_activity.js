'use strict';
const AbstractService = require('./abstract');

class UserActivityService extends AbstractService {
  filteredUserActivities(id, filter) {
    return this.models.UserActivity.find({
      'activity.id': id,
      'activity.course._id': filter.course ? filter.course : { $ne: null },
      'size.size': filter.size ? filter.size : { $ne: null },
      idcard: filter.idcard ? filter.idcard : { $ne: null },
    })
      .populate({
        path: 'user',
      })
      .populate({
        path: 'address',
      })
      .populate({
        path: 'emergency_contacts',
      });
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
    )
      .populate({
        path: 'user',
      })
      .populate({
        path: 'address',
      })
      .populate({
        path: 'emergency_contacts',
      });
  }

  async updateCheckedOut(id) {
    const user_activities = await this.models.UserActivity.findById(
      id
    ).populate({ path: 'activity.id' });

    const { coupons } = user_activities.activity.id;

    if (user_activities.state === 'checked_in') {
      return this.models.UserActivity.findByIdAndUpdate(
        id,
        {
          $set: {
            state: 'finished',
            coupons: coupons,
            user_record: {
              distance: user_activities.activity.course.range,
            },
          },
        },
        { new: true }
      )
        .populate({
          path: 'user',
        })
        .populate({
          path: 'address',
        })
        .populate({
          path: 'emergency_contacts',
        });
    } else if (user_activities.state === 'checked_out') {
      return 'Already checked out';
    } else {
      return 'Not in the right state';
    }
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

  async updateContestNoUserActivities(id, data) {
    return this.models.UserActivity.findByIdAndUpdate(
      id,
      {
        $set: {
          contest_no: data.contest_no,
        },
      },
      {
        new: true,
      }
    )
      .populate({
        path: 'user',
      })
      .populate({
        path: 'address',
      })
      .populate({
        path: 'emergency_contacts',
      });
  }
  async updatePrintedState(id) {
    return this.models.UserActivity.findByIdAndUpdate(
      id,
      {
        $set: {
          printed: true,
        },
      },
      {
        new: true,
      }
    )
      .populate({
        path: 'user',
      })
      .populate({
        path: 'address',
      })
      .populate({
        path: 'emergency_contacts',
      });
  }
  async updateReadState(user_activity_id, item_id) {
    const user_activity = await this.models.UserActivity.findById(
      user_activity_id
    );
    const index = user_activity.announcement.findIndex(
      (item) => item._id.toString() === item_id
    );

    if (index > -1) {
      const newAnnounment = user_activity.announcement;
      newAnnounment[index].state = 'read';

      return this.models.UserActivity.findByIdAndUpdate(
        user_activity_id,
        {
          $set: {
            announcement: newAnnounment,
          },
        },
        {
          new: true,
        }
      );
    } else {
      return 'Error';
    }
  }
}

module.exports = UserActivityService;
