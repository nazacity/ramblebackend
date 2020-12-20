'use strict';

const _ = require('lodash');
const passport = require('passport');
const passportCustom = require('passport-custom');
const CustomStrategy = passportCustom.Strategy;
const jwt = require('jsonwebtoken');

const config = require('./utils/config');
const { User, Employee } = require('./models');
const Partner = require('./models/partner');

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
    const { username, password } = req.body;

    if (!username || !password) {
      return done(null, false, { message: 'missing username & password' });
    }
    try {
      const user = await User.findOne({
        username: username.toLowerCase(),
      })
        .populate({ path: 'addresses' })
        .populate({ path: 'emergency_contacts' })
        .populate({ path: 'user_activities' });

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
      const user = await User.findOne({ _id: jwt_payload.sub }, { password: 0 })
        .populate({ path: 'addresses' })
        .populate({ path: 'emergency_contacts' })
        .populate({
          path: 'user_activities',
          populate: {
            path: 'activity.id',
            select: { activity_picture_url: 1, title: 1 },
          },
        });

      user.type = 'user';
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
