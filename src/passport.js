'use strict';

const _ = require('lodash');
const passport = require('passport');
const passportCustom = require('passport-custom');
const CustomStrategy = passportCustom.Strategy;
const jwt = require('jsonwebtoken');

const config = require('./utils/config');
const { User, Employee } = require('./models');
const Partner = require('./models/partner');

function _calculateAge(birthday) {
  // birthday is a date
  var ageDifMs = Date.now() - birthday.getTime();
  var ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(async function (_id, done) {
  if (user) {
    done(null, user);
  }
  // try {
  //   const user = await User.findOne({ _id }, { password: 0 }).lean();
  //   return done(null, user);
  // } catch (err) {
  //   done(err);
  // }
});

passport.use(
  'user',
  new CustomStrategy(async function (req, done) {
    const { username, password, lineId, user_picture_url } = req.body;
    if (!username || !password) {
      return done(null, false, { message: 'missing username & password' });
    }
    try {
      let user;
      if (lineId && user_picture_url) {
        user = await User.findOneAndUpdate(
          {
            username: username.toLowerCase(),
          },
          {
            $set: {
              lineId: lineId,
              user_picture_url: user_picture_url,
            },
          }
        )
          .populate({ path: 'addresses' })
          .populate({ path: 'emergency_contacts' })
          .populate({ path: 'user_records' })
          .populate({
            path: 'user_posts',
            populate: {
              path: 'activity',
              select: {
                activity_picture_url: 1,
                title: 1,
                actual_date: 1,
                state: 1,
              },
            },
          })
          .populate({
            path: 'user_activities',
            populate: {
              path: 'activity.id',
              select: {
                activity_picture_url: 1,
                title: 1,
                actual_date: 1,
                state: 1,
              },
            },
          });
      } else {
        user = await User.findOne({
          username: username.toLowerCase(),
        })
          .populate({ path: 'addresses' })
          .populate({ path: 'emergency_contacts' })
          .populate({ path: 'user_records' })
          .populate({
            path: 'user_posts',
            populate: {
              path: 'activity',
              select: {
                activity_picture_url: 1,
                title: 1,
                actual_date: 1,
                state: 1,
              },
            },
          })
          .populate({
            path: 'user_activities',
            populate: {
              path: 'activity.id',
              select: {
                activity_picture_url: 1,
                title: 1,
                actual_date: 1,
                state: 1,
              },
            },
          });
      }

      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      if (await user.validatePassword(password)) {
        return done(null, _.omit(user.toObject(), 'password'));
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    } catch (err) {
      done(err);
    }
  })
);

passport.use(
  'userLineId',
  new CustomStrategy(async function (req, done) {
    const { lineId, user_picture_url } = req.body;

    if (!lineId) {
      return done(null, false, { message: 'missing line id' });
    }
    try {
      let user;
      if (user_picture_url) {
        user = await User.findOneAndUpdate(
          {
            lineId: lineId,
          },
          {
            $set: {
              user_picture_url: user_picture_url,
            },
          },
          {
            new: true,
          }
        )
          .populate({ path: 'addresses' })
          .populate({ path: 'emergency_contacts' })
          .populate({ path: 'user_records' })
          .populate({
            path: 'user_posts',
            populate: {
              path: 'activity',
              select: {
                activity_picture_url: 1,
                title: 1,
                actual_date: 1,
                state: 1,
                location: 1,
              },
            },
          })
          .populate({
            path: 'user_activities',
            populate: {
              path: 'activity.id',
              select: {
                activity_picture_url: 1,
                title: 1,
                actual_date: 1,
                state: 1,
                location: 1,
              },
            },
          });
      } else {
        user = await User.findOne({
          lineId: lineId,
        })
          .populate({ path: 'addresses' })
          .populate({ path: 'emergency_contacts' })
          .populate({ path: 'user_records' })
          .populate({
            path: 'user_posts',
            populate: {
              path: 'activity',
              select: {
                activity_picture_url: 1,
                title: 1,
                actual_date: 1,
                state: 1,
                location: 1,
              },
            },
          })
          .populate({
            path: 'user_activities',
            populate: {
              path: 'activity.id',
              select: {
                activity_picture_url: 1,
                title: 1,
                actual_date: 1,
                state: 1,
                location: 1,
              },
            },
          });
      }
      if (!user) {
        return done(null, true, { message: 'No user is found' });
      } else {
        return done(null, _.omit(user.toObject(), 'password'));
      }
    } catch (err) {
      console.log(err);
      done(err);
    }
  })
);

passport.use(
  'userAppleId',
  new CustomStrategy(async function (req, done) {
    const { appleId } = req.body;

    if (!appleId) {
      return done(null, false, { message: 'missing line id' });
    }
    try {
      let user;

      user = await User.findOne({
        appleId: appleId,
      })
        .populate({ path: 'addresses' })
        .populate({ path: 'emergency_contacts' })
        .populate({ path: 'user_records' })
        .populate({
          path: 'user_posts',
          populate: {
            path: 'activity',
            select: {
              activity_picture_url: 1,
              title: 1,
              actual_date: 1,
              state: 1,
              location: 1,
            },
          },
        })
        .populate({
          path: 'user_activities',
          populate: {
            path: 'activity.id',
            select: {
              activity_picture_url: 1,
              title: 1,
              actual_date: 1,
              state: 1,
              location: 1,
            },
          },
        });

      if (!user) {
        return done(null, true, { message: 'No user is found' });
      } else {
        return done(null, _.omit(user.toObject(), 'password'));
      }
    } catch (err) {
      console.log(err);
      done(err);
    }
  })
);

passport.use(
  'employee',
  new CustomStrategy(async function (req, done) {
    const { username, password } = req.body;

    if (!username || !password) {
      return done(null, false, { message: 'missing username & password' });
    }

    try {
      const employee = await Employee.findOne({
        username: username.toLowerCase(),
      });

      if (!employee) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      if (await employee.validatePassword(password)) {
        return done(null, _.omit(employee.toObject(), 'password'));
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    } catch (err) {
      done(err);
    }
  })
);

passport.use(
  'partner',
  new CustomStrategy(async function (req, done) {
    const { username, password } = req.body;

    if (!username || !password) {
      return done(null, false, { message: 'missing username & password' });
    }

    try {
      const partner = await Partner.findOne({
        username: username.toLowerCase(),
      });

      if (!partner) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      if (await partner.validatePassword(password)) {
        return done(null, _.omit(partner.toObject(), 'password'));
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    } catch (err) {
      done(err);
    }
  })
);

const extractToken = (headers) => {
  if (/Bearer\s.+/.test(headers.authorization)) {
    return headers.authorization.substring(7);
  } else {
    return null;
  }
};

passport.use(
  'userJwt',
  new CustomStrategy(async function (req, done) {
    const token = extractToken(req.headers);

    try {
      await jwt.verify(token, config.jwt.secret, { issuer: config.jwt.issuer });
      const jwt_payload = jwt.decode(token);

      if (jwt_payload.type !== 'user') {
        done(null, false);
      }
      let user = await User.findOne({ _id: jwt_payload.sub }, { password: 0 })
        .populate({ path: 'addresses' })
        .populate({ path: 'emergency_contacts' })
        .populate({ path: 'user_records' })
        .populate({
          path: 'user_posts',
          populate: {
            path: 'activity',
            select: {
              activity_picture_url: 1,
              title: 1,
              actual_date: 1,
              state: 1,
            },
          },
        })
        .populate({
          path: 'user_activities',
          populate: {
            path: 'activity.id',
            select: {
              activity_picture_url: 1,
              title: 1,
              actual_date: 1,
              state: 1,
            },
          },
        });

      let age = 0;
      if (user.birthday) {
        age = _calculateAge(user.birthday);
      }
      user.type = 'user';
      if (age !== user.age) {
        user = await User.findByIdAndUpdate(
          user._id,
          {
            $set: {
              age: age,
            },
          },
          {
            password: 0,
            new: true,
          }
        )
          .populate({ path: 'addresses' })
          .populate({ path: 'emergency_contacts' })
          .populate({ path: 'user_records' })
          .populate({
            path: 'user_posts',
            populate: {
              path: 'activity',
              select: {
                activity_picture_url: 1,
                title: 1,
                actual_date: 1,
                state: 1,
              },
            },
          })
          .populate({
            path: 'user_activities',
            populate: {
              path: 'activity.id',
              select: {
                activity_picture_url: 1,
                title: 1,
                actual_date: 1,
                state: 1,
              },
            },
          });
      }

      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    } catch (error) {
      return done(null, false, { message: 'Invalid Token.' });
    }
  })
);

passport.use(
  'employeeJwt',
  new CustomStrategy(async function (req, done) {
    const token = extractToken(req.headers);
    try {
      await jwt.verify(token, config.jwt.secret, { issuer: config.jwt.issuer });
      const jwt_payload = jwt.decode(token);
      if (jwt_payload.type !== 'employee') {
        done(null, false);
      }
      const employee = await Employee.findOne({ _id: jwt_payload.sub }).lean();
      employee.type = 'employee';
      if (employee) {
        done(null, employee);
      } else {
        done(null, false);
      }
    } catch (error) {
      return done(null, false, { message: 'Invalid Token.' });
    }
  })
);

passport.use(
  'partnerJwt',
  new CustomStrategy(async function (req, done) {
    const token = extractToken(req.headers);
    try {
      await jwt.verify(token, config.jwt.secret, { issuer: config.jwt.issuer });

      const jwt_payload = jwt.decode(token);
      if (jwt_payload.type !== 'partner') {
        done(null, false);
      }
      const partner = await Partner.findOne({ _id: jwt_payload.sub })
        .populate({
          path: 'activities',
        })
        .lean();
      partner.type = 'partner';
      if (partner) {
        done(null, partner);
      } else {
        done(null, false);
      }
    } catch (error) {
      return done(null, false, { message: 'Invalid Token.' });
    }
  })
);

module.exports = passport;
