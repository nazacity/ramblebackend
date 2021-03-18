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

  findByIds(ids) {
    return this.models.UserYearRecord.find({
      _id: { $in: ids },
    })
      .sort({ year: -1 })
      .populate({
        path: 'user_activities',
        populate: {
          path: 'activity.id',
          select: { title: 1, activity_picture_url: 1, actual_date: 1 },
        },
      });
  }

  async findByUserAndYear(userId, year) {
    let userYearRecord;
    userYearRecord = await this.models.UserYearRecord.findOne({
      user: userId,
      year: year,
    });
    if (userYearRecord) {
      return userYearRecord;
    } else {
      userYearRecord = await this.models.UserYearRecord.create({
        user: userId,
        activity_number: 0,
        distance: 0,
        time_hr: 0,
        time_min: 0,
        average: 0,
      });

      const user = await this.models.User.findById(userId);
      const newUserRecords = [...user.user_records, userYearRecord._id];
      await this.models.User.findByIdAndUpdate(userId, {
        $set: {
          user_records: newUserRecords,
        },
      });
      return userYearRecord;
    }
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

  async updateUserYearRecord(userId, distance, userActivityId) {
    let userYearRecord;
    userYearRecord = await this.models.UserYearRecord.findOne({
      user: userId,
      year: new Date().getFullYear(),
    });

    if (!userYearRecord) {
      userYearRecord = await this.models.UserYearRecord.create({
        user: userId,
        activity_number: 1,
        distance: distance,
        time_hr: 0,
        time_min: 0,
        average: 0,
        user_activities: [userActivityId],
      });

      const user = await this.models.User.findById(userId);
      const newUserRecords = [...user.user_records, userYearRecord._id];
      await this.models.User.findByIdAndUpdate(userId, {
        $set: {
          user_records: newUserRecords,
        },
      });
      return this.models.UserYearRecord.findById(userYearRecord._id).populate({
        path: 'user_activities',
        populate: {
          path: 'activity.id',
          select: { title: 1, activity_picture_url: 1, actual_date: 1 },
        },
      });
    } else {
      const newDistance = userYearRecord.distance + distance;
      const newActivityNumber = userYearRecord.activity_number + 1;
      const updated_user_activities = [
        userActivityId,
        ...userYearRecord.user_activities,
      ];

      return this.models.UserYearRecord.findByIdAndUpdate(
        userYearRecord._id,
        {
          $set: {
            activity_number: newActivityNumber,
            distance: newDistance,
            user_activities: updated_user_activities,
          },
        },
        { new: true }
      ).populate({
        path: 'user_activities',
        populate: {
          path: 'activity.id',
          select: { title: 1, activity_picture_url: 1, actual_date: 1 },
        },
      });
    }
  }
}

module.exports = UserYearRecordService;
