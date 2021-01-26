'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const partnerState = require('../utils/constants/partner').partner_state;

const partner = new Schema(
  {
    username: { type: String, required: true, unqiue: true },
    password: { type: String, required: true },

    // personal information
    display_name: { type: String, required: true },

    picture_url: { type: String },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    company_name: { type: String },
    phone_number: { type: String, required: true },

    state: {
      type: String,
      enum: partnerState,
      required: true,
      default: 'deactive',
    },

    activities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
      },
    ],
  },
  { timestamps: true }
);

partner.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const Partner = mongoose.model('Partner', partner);

module.exports = Partner;
