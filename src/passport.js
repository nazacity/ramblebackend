'use strict';

const _ = require('lodash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const config = require('./utils/config');
const { User } = require('./models');

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(async function(_id, done) {
  try {
    const user = await User.findOne({ _id }, { password: 0 }).lean();
    return done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(new LocalStrategy(
  async function(username, password, done) {
    try {
      const user = await User.findOne({ username: username.toLowerCase() }).populate('base');
        
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
  }
));

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt.secret,
  issuer: config.jwt.issuer,
}, function(jwt_payload, done) {
  User.findOne({ _id: jwt_payload.sub }, function(err, user) {
    if (err) {
      return done(err, false);
    }
    
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
        // or you could create a new account
    }
  });
}));


module.exports = passport;
