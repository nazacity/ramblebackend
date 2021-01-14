const schedule = require('node-schedule');
const axios = require('axios');
const models = require('../models');
const config = require('./config');

module.exports = job = schedule.scheduleJob('1 59 0 * * 0-6', async () => {
  // module.exports = job = schedule.scheduleJob('1 * 12 * * 0-6', async () => {
  console.log(new Date());
  await updateOpenRegister();
  await updateEndRegister();
  await updateActivitiesState();
  await sendNotification14DaysBefore();
  await sendNotification7DaysBefore();
});

// Not Test yet
const updateOpenRegister = async () => {
  const preRegisterActivities = await models.Activity.find({
    state: 'pre_register',
    register_start_date: {
      $gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      $lt: new Date(Date.now()),
    },
  });

  console.log(preRegisterActivities);

  preRegisterActivities.map(async (item) => {
    await models.Activity.findByIdAndUpdate(
      item._id,
      {
        $set: {
          state: 'registering',
        },
      },
      {
        new: true,
      }
    );
  });
};

// Not Test yet
const updateEndRegister = async () => {
  const preRegisterActivities = await models.Activity.find({
    state: 'registering',
    register_end_date: {
      $gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      $lt: new Date(Date.now()),
    },
  });

  console.log(preRegisterActivities);

  preRegisterActivities.map(async (item) => {
    await models.Activity.findByIdAndUpdate(
      item._id,
      {
        $set: {
          state: 'end_register',
        },
      },
      {
        new: true,
      }
    );
  });
};

const updateActivitiesState = async () => {
  const actualDateActivities = await models.Activity.find({
    state: 'actual_date',
    actual_date: {
      $lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  actualDateActivities.map(async (item) => {
    await models.Activity.findByIdAndUpdate(
      item._id,
      {
        $set: {
          state: 'finished',
        },
      },
      {
        new: true,
      }
    );
    await updateUserActivitiesFinished(item.user_activities);
  });

  const endRegisterActivities = await models.Activity.find({
    state: 'end_register',
    actual_date: {
      $lt: new Date(Date.now()),
    },
  });

  endRegisterActivities.map(async (item) => {
    await models.Activity.findByIdAndUpdate(
      item._id,
      {
        $set: {
          state: 'actual_date',
        },
      },
      {
        new: true,
      }
    );
    await updateUserActivitiesActualDate(item.user_activities);
  });
};

const updateUserActivitiesActualDate = async (userActivities) => {
  return Promise.all(
    userActivities.map(async (item) => {
      await models.UserActivity.findOneAndUpdate(
        { _id: item, state: 'upcoming' },
        {
          $set: {
            state: 'actual_date',
          },
        },
        {
          new: true,
        }
      );
    })
  );
};

const updateUserActivitiesFinished = async (userActivities) => {
  return Promise.all(
    userActivities.map(async (item) => {
      await models.UserActivity.findOneAndUpdate(
        { _id: item, state: 'actual_date' },
        {
          $set: {
            state: 'not_finished',
          },
        },
        {
          new: true,
        }
      );
    })
  );
};

const sendNotification14DaysBefore = async () => {
  const upcoming14DaysActivities = await models.Activity.find({
    state: 'end_register',
    actual_date: {
      $lt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      $gt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  upcoming14DaysActivities.map(async (item) => {
    const activity = await models.Activity.findById(item._id).populate({
      path: 'user_activities',
      populate: { path: 'user' },
    });

    if (activity.user_activities.length > 1500) {
      const user_device_tokens1 = await mapUserDeviceToken(
        activity.user_activities.slice(0, 1500)
      );
      const user_device_tokens2 = await mapUserDeviceToken(
        activity.user_activities.slice(1500)
      );
      try {
        const sendNotification = await axios({
          method: 'post',
          url: 'https://onesignal.com/api/v1/notifications',
          data: {
            app_id: config.onesignal.app_id,
            include_player_ids: [...user_device_tokens1],
            headings: { en: '14 Days Before', th: '14 วัน ก่อนวันกิจกรรม' },
            contents: {
              en: `${activity.title} Activity is upcoming please check`,
              th: `กิจกรรม ${activity.title} กำลังจะมาถึง กรุณาตรวจสอบ`,
            },
          },
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Basic ${config.onesignal.rest_api_key}`,
          },
        });
      } catch (error) {
        console.log(error.response);
      }
      try {
        const sendNotification = await axios({
          method: 'post',
          url: 'https://onesignal.com/api/v1/notifications',
          data: {
            app_id: config.onesignal.app_id,
            include_player_ids: [...user_device_tokens2],
            headings: { en: '14 Days Before', th: '14 วัน ก่อนวันกิจกรรม' },
            contents: {
              en: `${activity.title} Activity is upcoming please check`,
              th: `กิจกรรม ${activity.title} กำลังจะมาถึง กรุณาตรวจสอบ`,
            },
          },
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Basic ${config.onesignal.rest_api_key}`,
          },
        });
      } catch (error) {
        console.log(error.response);
      }
    } else {
      const user_device_tokens = await mapUserDeviceToken(
        activity.user_activities
      );

      try {
        const sendNotification = await axios({
          method: 'post',
          url: 'https://onesignal.com/api/v1/notifications',
          data: {
            app_id: config.onesignal.app_id,
            include_player_ids: [...user_device_tokens],
            headings: { en: '14 Days Before', th: '14 วัน ก่อนวันกิจกรรม' },
            contents: {
              en: `Activity is upcoming please check`,
              th: `กิจกรรมกำลังจะมาถึง กรุณาตรวจสอบ`,
            },
          },
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Basic ${config.onesignal.rest_api_key}`,
          },
        });
      } catch (error) {
        console.log(error.response);
      }
    }
  });
};

const mapUserDeviceToken = async (userActivities) => {
  return Promise.all(
    userActivities.map(async (item) => {
      return item.user.device_token;
    })
  );
};

const sendNotification7DaysBefore = async () => {
  const upcoming7DaysActivities = await models.Activity.find({
    state: 'end_register',
    actual_date: {
      $lt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      $gt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  upcoming7DaysActivities.map(async (item) => {
    const activity = await models.Activity.findById(item._id).populate({
      path: 'user_activities',
      populate: { path: 'user' },
    });

    const user_device_tokens = await mapUserDeviceToken(
      activity.user_activities
    );

    try {
      const sendNotification = await axios({
        method: 'post',
        url: 'https://onesignal.com/api/v1/notifications',
        data: {
          app_id: config.onesignal.app_id,
          include_player_ids: [...user_device_tokens],
          headings: { en: '7 Days Before', th: '7 วัน ก่อนวันกิจกรรม' },
          contents: {
            en: `Activity is upcoming please check`,
            th: `กิจกรรมกำลังจะมาถึง กรุณาตรวจสอบ`,
          },
        },
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Basic ${config.onesignal.rest_api_key}`,
        },
      });
    } catch (error) {
      console.log(error.response);
    }
  });
};
