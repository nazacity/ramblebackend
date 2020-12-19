'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const userActivityStateEnum = require('../utils/constants/activity')
  .user_activity_state;

const user_activity = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  activity: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
    },
    activity_picture_url: { type: String },
    actual_date: { type: Date, required: true },
    title: { type: String, required: true },
    sub_title: { type: String, required: true },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      province: { type: String, required: true },
      place_name: { type: String, required: true },
    },
    course: {
      title: { type: String, required: true },
      range: { type: Number, required: true },
      price: { type: Number, required: true },
      course_picture_url: { type: String, required: true },
    },
  },

  contest_no: { type: Number, default: '' },
  shirt_detail: {
    style: { type: String, required: true },
    shirt_picturl_url: { type: String, required: true },
    size: { type: String, required: true },
  },
  address: {
    address: { type: String, required: true },
    province: { type: String, required: true },
    zip: { type: String, required: true },
  },
  user_emergency_contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmergencyContact',
  },
  user_record: {
    total_time: { type: Number },
    range: { type: Number },
    average_time: { type: Number },
  },
  state: {
    type: String,
    enum: userActivityStateEnum,
    required: true,
    default: 'upcoming',
  },
  coupons: [
    {
      id: { type: String },
      description: { type: String },
      coupon_picture_url: { type: String },
      state: { type: String },
    },
  ],
});

const User_Activity = mongoose.model('User_Activity', user_activity);

module.exports = User_Activity;
