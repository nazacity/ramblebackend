'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const emergency_contact = new Schema(
  {
    name: { type: String, required: true },
    phone_number: { type: String, required: true },
    relationship: { type: String, required: true },
  },
  { timestamps: true }
);

const Emergency_Contact = mongoose.model(
  'Emergency_Contact',
  emergency_contact
);

module.exports = Emergency_Contact;
