'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const userActivityStateEnum = require('../utils/constants/activity')
  .user_activity_state;

const announcementState = require('../utils/constants/activity')
  .announcement_state;

const user_activity = new Schema(
  {
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

    user_post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserPost',
    },

    contest_no: { type: String, default: '' },
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
    transaction: [
      {
        id: { type: String },
        sendingBank: { type: String },
        payDate: { type: Date },
        amount: { type: Number, default: 0 },
      },
    ],
    printed: {
      type: Boolean,
      default: false,
    },
    idcard: { type: String },
    announcement: [
      {
        active: { type: Boolean, default: true },
        title: { type: String, require: true },
        description: { type: String, require: true },
        picture_url: { type: String },
        state: {
          type: String,
          enum: announcementState,
          required: true,
          default: 'not_read',
        },
        createdAt: { type: Date, require: true, default: new Date() },
      },
    ],
  },
  { timestamps: true }
);

user_activity.index({
  activity: { id: 1, course: { _id: 1 } },
  size: { size: 1 },
});

const User_Activity = mongoose.model('User_Activity', user_activity);

module.exports = User_Activity;
