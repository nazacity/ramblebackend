'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const partner_Register_Form = new Schema(
  {
    first_name: { type: String, require: true },
    last_name: { type: String, require: true },
    company_name: { type: String, require: true },
    phone_number: { type: String, require: true },
    line_id: { type: String, require: true },
  },
  { timestamps: true }
);

const Partner_Register_Form = mongoose.model(
  'Partner_Register_Form',
  partner_Register_Form
);

module.exports = Partner_Register_Form;
