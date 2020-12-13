'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const user_post = new Schema({
  form_team: { type: Boolean, required: true },
  share_accommodation: { type: Boolean, required: true },
  share_transportaion: { type: Boolean, required: true },
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
});

const User_Post = mongoose.model('User_Post', user_post);

module.exports = User_Post;
