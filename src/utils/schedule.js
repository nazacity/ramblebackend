const schedule = require('node-schedule');

const models = require('../models');

// module.exports = job = schedule.scheduleJob('* 59 0 * * 0-6', function () {
//   console.log('The answer to life, the universe, and everything!');
// });

const updateActivitiesState = async () => {
  const actualDateActivities = await models.Activity.find({
    state: 'actual_date',
    actual_date: {
      $lt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 7 * 60 * 60),
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
      $lt: new Date(Date.now() + 7 * 60 * 60),
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

updateActivitiesState();
