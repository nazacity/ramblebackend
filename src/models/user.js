'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const permissionEnum = require('../utils/constants/permission').enum;

const user = new Schema({
  username: { type: String, required: true, unqiue: true },
  password: { type: String, required: true },

  // personal information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },

  base: { type: Schema.Types.ObjectId, required: true, ref: 'MilitaryBase' },
  permission: { type: String, enum: permissionEnum },

  avatar: { type: String },
  rank: { type: String }
});

user.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', user);

module.exports = User;