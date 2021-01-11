'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const activityStateEnum = require('../utils/constants/activity').activity_state;
const { provinceEnum, regionEnum } = require('../utils/constants/provinces');

const activity = new Schema({
  partner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
  },

  // activity information
  activity_picture_url: { type: String },
  title: { type: String, required: true },
  sub_title: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    province: { type: String, required: true, enum: provinceEnum },
    region: { type: String, required: true, enum: regionEnum },
    place_name: { type: String, required: true },
  },
  actual_date: { type: Date, required: true },
  register_start_date: { type: Date, required: true },
  register_end_date: { type: Date, required: true },

  courses: [
    {
      id: { type: String, required: true },
      title: { type: String, required: true },
      range: { type: Number, required: true },
      price: { type: Number, required: true },
      course_picture_url: { type: String, required: true },
      register_no: { type: Number, required: true, default: 0 },
    },
  ],

  timeline: [
    {
      id: { type: String, required: true },
      time: { type: String, required: true },
      title: { type: String, required: true },
      description: { type: String },
    },
  ],

  rules: [
    {
      id: { type: String, required: true },
      title: { type: String, required: true },
      detail: [
        {
          id: { type: String },
          description: { type: String },
        },
      ],
    },
  ],

  shirt_detail: [
    {
      style: { type: String, required: true },
      shirt_picturl_url: { type: String, required: true },
      // quality: { type: Number, required: true, default: 0 },
    },
  ],

  size: [
    {
      id: { type: String, required: true },
      size: { type: String, required: true },
      description: { type: String, required: true },
      male_quality: { type: Number, required: true, default: 0 },
      female_quality: { type: Number, required: true, default: 0 },
    },
  ],

  shirt_report: [
    {
      course: { type: String, required: true },
      size: [
        {
          size: { type: String, required: true },
          male_quality: { type: Number, required: true, default: 0 },
          female_quality: { type: Number, required: true, default: 0 },
        },
      ],
    },
  ],

  reception: {
    atevent: { type: Number, required: true, default: 0 },
    sendAddress: { type: Number, required: true, default: 0 },
  },

  report_infomation: {
    participant_number: { type: Number, required: true, default: 0 },
    participant_male_number: { type: Number, required: true, default: 0 },
    participant_female_number: { type: Number, required: true, default: 0 },
    revenue: { type: Number, required: true, default: 0 },
    revenue_after_cutting: { type: Number, required: true, default: 0 },
    age_20: { type: Number, required: true, default: 0 },
    age_20_30: { type: Number, required: true, default: 0 },
    age_30_40: { type: Number, required: true, default: 0 },
    age_40_50: { type: Number, required: true, default: 0 },
    age_50: { type: Number, required: true, default: 0 },
  },

  rules1: { type: String, required: true },

  more_detail: { type: String, required: true },

  condition: { type: String, required: true },

  state: { type: String, enum: activityStateEnum, default: 'pre_register' },

  user_activities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User_Activity',
    },
  ],

  gifts: [
    {
      id: { type: String },
      description: { type: String },
      gift_picture_url: { type: String },
    },
  ],

  coupons: [
    {
      description: { type: String },
      coupon_picture_url: { type: String },
    },
  ],
  senderAddress: {
    name: { type: String, require: true },
    address: { type: String, require: true },
    province: { type: String, require: true },
    zip: { type: String, require: true },
    phone_number: { type: String, require: true },
  },
  announcement: [
    {
      active: { type: Boolean, default: true },
      title: { type: String, require: true },
      description: { type: String, require: true },
      picture_url: { type: String },
      createdAt: { type: Date, require: true, default: new Date() },
    },
  ],
});

const Activity = mongoose.model('Activity', activity);

module.exports = Activity;
