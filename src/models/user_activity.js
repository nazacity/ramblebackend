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
    // activity_picture_url: { type: String },
    // actual_date: { type: Date, required: true },
    // title: { type: String, required: true },
    // sub_title: { type: String, required: true },
    // location: {
    //   lat: { type: Number },
    //   lng: { type: Number },
    //   province: { type: String, required: true },
    //   place_name: { type: String, required: true },
    // },
    course: {
      _id: { type: String, required: true },
      title: { type: String, required: true },
      range: { type: Number, required: true },
      price: { type: Number, required: true },
      course_picture_url: { type: String, required: true },
    },
  },

  contest_no: { type: Number, default: '' },
  // shirt_detail: {
  //   style: { type: String, required: true },
  //   shirt_picturl_url: { type: String, required: true },
  //   size: { type: String, required: true },
  // },
  size: {
    id: { type: String, required: true },
    size: { type: String, required: true },
    description: { type: String, required: true },
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  },
  emergency_contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmergencyContact',
  },
  user_record: {
    time_hr: { type: Number, default: 0 },
    time_min: { type: Number, default: 0 },
    time_second: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
  },
  state: {
    type: String,
    enum: userActivityStateEnum,
    required: true,
    default: 'waiting_payment',
  },
  coupons: [
    {
      description: { type: String },
      coupon_picture_url: { type: String },
      state: { type: Boolean, default: false },
    },
  ],
  transaction: {
    id: { type: String },
    sendingBank: { type: String },
    payDate: { type: Date },
  },
});

const User_Activity = mongoose.model('User_Activity', user_activity);

module.exports = User_Activity;
