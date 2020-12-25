'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;
const userPostStateEnum = require('../utils/constants/activity').user_post;

const user_post = new Schema({
  form_team: { type: Boolean, required: true },
  share_accommodation: { type: Boolean, required: true },
  share_transportation: { type: Boolean, required: true },
  share_trip: { type: Boolean, required: true },
  male: { type: Boolean, required: true },
  female: { type: Boolean, required: true },
  activity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  description: { type: String, require: true },
  province: { type: String, require: true },
  createdAt: { type: Date, default: new Date() },
  updatedAt: { type: Date, default: new Date() },
  state: {
    type: String,
    enum: userPostStateEnum,
    required: true,
    default: 'finding',
  },
});

const User_Post = mongoose.model('User_Post', user_post);

module.exports = User_Post;
