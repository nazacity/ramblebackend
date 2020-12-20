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

  async updateUserActivity(id, userActivityId, user) {
    const activity = await this.models.Activity.findById(id);

    let newParticipantBygender;
    if (user.gender === 'male') {
      newParticipantBygender = {
        participant_male_number:
          activity.report_infomation.participant_male_number + 1,
        participant_female_number:
          activity.report_infomation.participant_female_number,
      };
    } else if (user.gender === 'male') {
      newParticipantBygender = {
        participant_male_number:
          activity.report_infomation.participant_male_number,
        participant_female_number:
          activity.report_infomation.participant_female_number + 1,
      };
    }

    let newAgeGroup;
    if (user.age <= 20) {
      newAgeGroup = {
        age_20: activity.report_infomation.age_20 + 1,
        age_20_30: activity.report_infomation.age_20_30,
        age_30_40: activity.report_infomation.age_30_40,
        age_40_50: activity.report_infomation.age_40_50,
        age_50: activity.report_infomation.age_50,
      };
    } else if (user.age > 20 && user.age <= 30) {
      newAgeGroup = {
        age_20: activity.report_infomation.age_20,
        age_20_30: activity.report_infomation.age_20_30 + 1,
        age_30_40: activity.report_infomation.age_30_40,
        age_40_50: activity.report_infomation.age_40_50,
        age_50: activity.report_infomation.age_50,
      };
    } else if (user.age > 30 && user.age <= 40) {
      newAgeGroup = {
        age_20: activity.report_infomation.age_20,
        age_20_30: activity.report_infomation.age_20_30,
        age_30_40: activity.report_infomation.age_30_40 + 1,
        age_40_50: activity.report_infomation.age_40_50,
        age_50: activity.report_infomation.age_50,
      };
    } else if (user.age > 40 && user.age <= 50) {
      newAgeGroup = {
        age_20: activity.report_infomation.age_20,
        age_20_30: activity.report_infomation.age_20_30,
        age_30_40: activity.report_infomation.age_30_40,
        age_40_50: activity.report_infomation.age_40_50 + 1,
        age_50: activity.report_infomation.age_50,
      };
    } else if (user.age > 50) {
      newAgeGroup = {
        age_20: activity.report_infomation.age_20,
        age_20_30: activity.report_infomation.age_20_30,
        age_30_40: activity.report_infomation.age_30_40,
        age_40_50: activity.report_infomation.age_40_50,
        age_50: activity.report_infomation.age_50 + 1,
      };
    }

    const new_report_infomation = {
      participant_number: activity.report_infomation.participant_number + 1,
      ...newParticipantBygender,
      ...newAgeGroup,
    };

    if (activity.user_activities) {
      return this.models.Activity.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            user_activities: [...activity.user_activities, userActivityId],
            report_infomation: { ...new_report_infomation },
          },
        }
      );
    } else {
      return this.models.Activity.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            user_activities: [userActivityId],
            report_infomation: { ...new_report_infomation },
          },
        }
      );
    }
  }
}

module.exports = ActivityService;
