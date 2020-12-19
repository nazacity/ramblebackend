'use strict';

const bcrypt = require('bcrypt');
const { provinceDict } = require('../utils/constants/provinces');

const AbstractService = require('./abstract');

class ActivityService extends AbstractService {
  listActivity(filter, skip, limit) {
    return this.models.Activity.find(
      {
        title: filter.title ? filter.title : { $ne: null },
        'location.region': filter.region ? filter.region : { $ne: null },
        'location.province': filter.province ? filter.province : { $ne: null },

        register_end_date: filter.from
          ? { $gte: filter.from, $lte: filter.to }
          : { $ne: null },
        actual_date: filter.from
          ? { $gte: filter.from, $lte: filter.to }
          : { $ne: null },

        courses: filter.range_min
          ? {
              $elemMatch: {
                range: {
                  $gte: filter.range_min ? +filter.range_min : 0,
                  $lte: filter.range_max ? +filter.range_max : 150,
                },
              },
            }
          : { $ne: null },
        state: { $in: ['registering', 'pre_register'] },
      },
      {
        user_activities: 0,
        description: 0,
        courses: 0,
        timeline: 0,
        rules: 0,
        more_detail: 0,
        shirt_detail: 0,
        report_infomation: 0,
        condition: 0,
        user_activities: 0,
      }
    )
      .skip(+skip)
      .limit(+limit);
  }

  findById(id) {
    return this.models.Activity.findById(id);
  }

  listPromoteActivity(filter, skip, limit) {
    return this.models.Activity.find(
      {
        state: { $in: ['registering', 'pre_register'] },
      },
      {
        user_activities: 0,
        description: 0,
        courses: 0,
        timeline: 0,
        rules: 0,
        more_detail: 0,
        shirt_detail: 0,
        report_infomation: 0,
        condition: 0,
        user_activities: 0,
      }
    )
      .skip(+skip)
      .limit(+limit);
  }

  async createActivity(data) {
    const region = provinceDict[data.location.province];
    data.location = {
      ...data.location,
      region: region,
    };
    return this.models.Activity.create(data);
  }

  async editActivity(id, data) {
    if (data.location?.province) {
      let region = provinceDict[data.location.province];
      data.location = {
        ...data.location,
        region: region,
      };
      return this.models.Activity.findOneAndUpdate(
        { _id: id },
        {
          $set: data,
        },
        {
          new: true,
        }
      );
    } else {
      return this.models.Activity.findOneAndUpdate(
        { _id: id },
        {
          $set: data,
        },
        {
          new: true,
        }
      );
    }
  }

  async updateUserActivity(id, userActivityId) {
    const activity = await this.models.Activity.findById(id);
    if (activity.user_activities) {
      return this.models.Activity.findOneAndUpdate(
        { _id: id },
        {
          user_activities: [...activity.user_activities, userActivityId],
        }
      );
    } else {
      return this.models.Activity.findOneAndUpdate(
        { _id: id },
        {
          user_activities: [userActivityId],
        }
      );
    }
  }
}

module.exports = ActivityService;
