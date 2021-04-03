const schedule = require('node-schedule');
const axios = require('axios');
const models = require('../models');
const config = require('./config');

module.exports = job = schedule.scheduleJob('1 59 0 * * 0-6', async () => {
  // module.exports = job = schedule.scheduleJob('* * 10 * * 0-6', async () => {
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
  const registerActivities = await models.Activity.find({
    state: 'registering',
    register_end_date: {
      $gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      $lt: new Date(Date.now()),
    },
  });

  registerActivities.map(async (item) => {
    const new_user_activities = await deleteNonPaidUserActivities(
      item.user_activities
    );

    var filteredNull = new_user_activities.filter(function (el) {
      return el != null;
    });

    await models.Activity.findByIdAndUpdate(
      item._id,
      {
        $set: {
          state: 'end_register',
          user_activities: filteredNull,
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
      $gt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      $lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
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
    // await updateUserActivitiesFinished(item.user_activities);
  });

  const endRegisterActivities = await models.Activity.find({
    state: 'end_register',
    actual_date: {
      $gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
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

// const updateUserActivitiesFinished = async (userActivities) => {
//   return Promise.all(
//     userActivities.map(async (item) => {
//       await models.UserActivity.findOneAndUpdate(
//         { _id: item, state: 'actual_date' },
//         {
//           $set: {
//             state: 'not_finished',
//           },
//         },
//         {
//           new: true,
//         }
//       );
//     })
//   );
// };

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

const deleteNonPaidUserActivities = async (userActivities) => {
  return Promise.all(
    userActivities.map(async (item) => {
      const userActivity = await models.UserActivity.findOneAndRemove({
        _id: item,
        state: 'waiting_payment',
      });

      if (userActivity) {
        const user = await models.User.findById(userActivity.user).populate({
          path: 'user',
        });

        const user_activities = user.user_activities.filter(
          (item) => item._id.toString() !== userActivity._id.toString()
        );

        const newUser = await models.User.findByIdAndUpdate(
          user._id,
          {
            $set: {
              user_activities: user_activities,
            },
          },
          {
            new: true,
          }
        );

        const activity = await models.Activity.findById(
          userActivity.activity.id
        );

        const sizeIndex = activity.size.findIndex(
          (item) => item.size === userActivity.size.size
        );
        const size = activity.size[sizeIndex];

        const courseIndex = activity.courses.findIndex(
          (item) => item._id.toString() === userActivity.activity.course._id
        );
        const course = activity.courses[courseIndex];

        const oldShirtReportIndex = activity.shirt_report.findIndex(
          (item) => item.course === userActivity.activity.course.title
        );
        const shirt_report = activity.shirt_report;
        const oldSizeIndex = activity.shirt_report[
          oldShirtReportIndex
        ].size.findIndex((item) => item.size === userActivity.size.size);

        // const newShirtReportIndex = activity.shirt_report.findIndex(
        //   (item) => item.course === course.title
        // );
        // const newSizeIndex = activity.shirt_report[
        //   newShirtReportIndex
        // ].size.findIndex((item) => item.size === userActivity.size.size);

        let newParticipantBygender;
        if (user.gender === 'male') {
          shirt_report[oldShirtReportIndex].size[
            oldSizeIndex
          ].male_quality -= 1;
          newParticipantBygender = {
            participant_male_number:
              activity.report_infomation.participant_male_number - 1,
            participant_female_number:
              activity.report_infomation.participant_female_number,
          };

          // shirt_report[newShirtReportIndex].size[
          //   newSizeIndex
          // ].male_quality += 1;
        } else if (user.gender === 'female') {
          shirt_report[oldShirtReportIndex].size[
            oldSizeIndex
          ].female_quality -= 1;
          newParticipantBygender = {
            participant_male_number:
              activity.report_infomation.participant_male_number,
            participant_female_number:
              activity.report_infomation.participant_female_number - 1,
          };

          // shirt_report[newShirtReportIndex].size[
          //   newSizeIndex
          // ].female_quality += 1;
        }

        const courses = activity.courses;
        const oldCourseIndex = activity.courses.findIndex(
          (item) =>
            item._id.toString() === userActivity.activity.course._id.toString()
        );
        courses[oldCourseIndex].register_no -= 1;
        // const newCourseIndex = activity.courses.findIndex(
        //   (item) =>
        //     item._id.toString() === userActivity.activity.course._id.toString()
        // );
        // courses[newCourseIndex].register_no += 1;

        let newAgeGroup;
        if (user.age <= 20) {
          newAgeGroup = {
            age_20: activity.report_infomation.age_20 - 1,
            age_20_30: activity.report_infomation.age_20_30,
            age_30_40: activity.report_infomation.age_30_40,
            age_40_50: activity.report_infomation.age_40_50,
            age_50: activity.report_infomation.age_50,
          };
        } else if (user.age > 20 && user.age <= 30) {
          newAgeGroup = {
            age_20: activity.report_infomation.age_20,
            age_20_30: activity.report_infomation.age_20_30 - 1,
            age_30_40: activity.report_infomation.age_30_40,
            age_40_50: activity.report_infomation.age_40_50,
            age_50: activity.report_infomation.age_50,
          };
        } else if (user.age > 30 && user.age <= 40) {
          newAgeGroup = {
            age_20: activity.report_infomation.age_20,
            age_20_30: activity.report_infomation.age_20_30,
            age_30_40: activity.report_infomation.age_30_40 - 1,
            age_40_50: activity.report_infomation.age_40_50,
            age_50: activity.report_infomation.age_50,
          };
        } else if (user.age > 40 && user.age <= 50) {
          newAgeGroup = {
            age_20: activity.report_infomation.age_20,
            age_20_30: activity.report_infomation.age_20_30,
            age_30_40: activity.report_infomation.age_30_40,
            age_40_50: activity.report_infomation.age_40_50 - 1,
            age_50: activity.report_infomation.age_50,
          };
        } else if (user.age > 50) {
          newAgeGroup = {
            age_20: activity.report_infomation.age_20,
            age_20_30: activity.report_infomation.age_20_30,
            age_30_40: activity.report_infomation.age_30_40,
            age_40_50: activity.report_infomation.age_40_50,
            age_50: activity.report_infomation.age_50 - 1,
          };
        }

        const new_report_infomation = {
          participant_number: activity.report_infomation.participant_number - 1,
          ...newParticipantBygender,
          ...newAgeGroup,
        };

        // update reception
        let newReception = activity.reception;
        if (userActivity.address === '5ff6600d20ed83388ab4ccbd') {
          newReception.atevent = activity.reception.atevent - 1;
        } else {
          newReception.sendAddress = activity.reception.sendAddress - 1;
        }

        await models.Activity.findByIdAndUpdate(userActivity.activity.id, {
          $set: {
            shirt_report: shirt_report,
            courses: courses,
            report_infomation: { ...new_report_infomation },
            reception: newReception,
          },
        });

        const user_device_token = user.device_token;

        try {
          const sendNotification = await axios({
            method: 'post',
            url: 'https://onesignal.com/api/v1/notifications',
            data: {
              app_id: config.onesignal.app_id,
              include_player_ids: [user_device_token],
              headings: {
                en: 'Cancel Confirm',
                th: 'ยืนยันการยกเลิก',
              },
              contents: {
                en: `${activity.title} was canceled due to no payment`,
                th: `${activity.title}ถูกยกเลิกเนื่องจากไม่มีการชำระ`,
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

        return;
      } else {
        return item;
      }
    })
  );
};
