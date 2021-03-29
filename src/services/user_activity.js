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
        path: 'emergency_contact',
      });
  }

  findById(id) {
    return this.models.UserActivity.findById(id)
      .populate({
        path: 'user',
      })
      .populate({
        path: 'address',
      })
      .populate({
        path: 'emergency_contact',
      })
      .populate({
        path: 'activity.id',
      });
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
        path: 'emergency_contact',
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
          path: 'emergency_contact',
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
      .populate({ path: 'activity.id' })
      .populate({
        path: 'emergency_contact',
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
      .populate({ path: 'activity.id' })
      .populate({
        path: 'emergency_contact',
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
      )
        .populate({
          path: 'user',
        })
        .populate({
          path: 'address',
        })
        .populate({ path: 'activity.id' })
        .populate({
          path: 'emergency_contact',
        });
    } else {
      return 'Error';
    }
  }
  async editUserActivity(id, data) {
    const activity = await this.models.Activity.findById(data.activity.id);

    const sizeIndex = activity.size.findIndex(
      (item) => item.size === data.size.size
    );
    const size = activity.size[sizeIndex];

    const courseIndex = activity.courses.findIndex(
      (item) => item._id.toString() === data.activity.course._id
    );
    const course = activity.courses[courseIndex];

    const oldUserActivity = await this.models.UserActivity.findById(id);

    const oldShirtReportIndex = activity.shirt_report.findIndex(
      (item) => item.course === oldUserActivity.activity.course.title
    );
    const shirt_report = activity.shirt_report;
    const oldSizeIndex = activity.shirt_report[
      oldShirtReportIndex
    ].size.findIndex((item) => item.size === oldUserActivity.size.size);

    const newShirtReportIndex = activity.shirt_report.findIndex(
      (item) => item.course === course.title
    );
    const newSizeIndex = activity.shirt_report[
      newShirtReportIndex
    ].size.findIndex((item) => item.size === data.size.size);

    if (data.user.gender === 'male') {
      shirt_report[oldShirtReportIndex].size[oldSizeIndex].male_quality -= 1;
      shirt_report[newShirtReportIndex].size[newSizeIndex].male_quality += 1;
    } else if (data.user.gender === 'female') {
      shirt_report[oldShirtReportIndex].size[oldSizeIndex].female_quality -= 1;
      shirt_report[newShirtReportIndex].size[newSizeIndex].female_quality += 1;
    }

    const courses = activity.courses;
    const oldCourseIndex = activity.courses.findIndex(
      (item) =>
        item._id.toString() === oldUserActivity.activity.course._id.toString()
    );
    courses[oldCourseIndex].register_no -= 1;
    const newCourseIndex = activity.courses.findIndex(
      (item) => item._id.toString() === data.activity.course._id.toString()
    );
    courses[newCourseIndex].register_no += 1;

    await this.models.Activity.findByIdAndUpdate(data.activity.id, {
      $set: {
        shirt_report: shirt_report,
        courses: courses,
      },
    });

    const newUserActivity = this.models.UserActivity.findByIdAndUpdate(
      id,
      {
        $set: {
          size: size,
          activity: {
            id: activity._id,
            course: course,
          },
          state: data.state,
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
        path: 'emergency_contact',
      });
    return newUserActivity;
  }
}

module.exports = UserActivityService;
