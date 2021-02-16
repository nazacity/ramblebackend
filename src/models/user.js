'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const {
  user_state,
  user_gender,
  blood_type,
  vaccine_state,
  identity_state,
} = require('../utils/constants/user');

const user = new Schema(
  {
    username: { type: String, unqiue: true },
    password: { type: String },

    // personal information
    display_name: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    phone_number: { type: String },
    birthday: { type: Date },
    age: { type: Number },
    gender: { type: String, enum: user_gender },
    blood_type: { type: String, enum: blood_type },
    idcard: { type: String },
    user_picture_url: { type: String },
    user_background_picture_url: { type: String },
    device_token: { type: String },
    lineId: { type: String },
    appleId: { type: String },
    vefiry_information: {
      id_card_piture_url: { type: String },
      id_card_with_person_piture_url: { type: String },
      state: {
        type: String,
        enum: identity_state,
        required: true,
        default: 'not_verify',
      },
    },
    vefiry_vaccine: {
      vaccine_confirm_piture_url: { type: String },
      state: {
        type: String,
        enum: vaccine_state,
        required: true,
        default: 'not_verify',
      },
    },

    state: {
      type: String,
      enum: user_state,
      required: true,
      default: 'active',
    },

    emergency_contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Emergency_Contact',
      },
    ],
    addresses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
      },
    ],
    user_posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User_Post',
      },
    ],
    user_records: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User_Year_Record',
      },
    ],
    user_activities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User_Activity',
      },
    ],
  },
  { timestamps: true }
);

user.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', user);

module.exports = User;
