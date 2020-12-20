const schedule = require('node-schedule');

const models = require('../models');

// module.exports = job = schedule.scheduleJob('1-50 * * * * *', function () {
//   console.log('The answer to life, the universe, and everything!');
// });

const updateActivitiesState = async () => {
  const activities = await models.Activity.find({
    state: 'end_register',
    actual_date: {
      $lt: new Date(),
      $gt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  activities.map(async (item) => {
    await models.Activity.findByIdAndUpdate(
      item._id,
      {
        $set: {
          //   state: 'actual_date',
        },
      },
      {
        new: true,
      }
    );

    return Promise.all(
      item.user_activities.map(async (item) => {
        const test = await models.UserActivity.findByIdAndUpdate(
          item,
          {
            $set: {
              state: 'actual_date',
            },
          },
          {
            new: true,
          }
        );
        console.log(test);
      })
    );
  });
};

updateActivitiesState();
