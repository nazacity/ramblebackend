'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const user = new Schema({
  _id: String,
  username: { type: String, required: true, unqiue: true },
  password: { type: String, required: true },
  baseId: { type: String, requiredd: true },
  permission: { type: String, enum: ['admin', 'editor', 'viewer'] },

  avatar: { type: String },
  rank: { type: String }
});

const User = mongoose.model('User', user);

module.exports = User;