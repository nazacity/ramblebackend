'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const address = new Schema(
  {
    address: { type: String, require: true },
    province: { type: String, require: true },
    zip: { type: String, require: true },
    phone_number: { type: String, require: true },
  },
  { timestamps: true }
);

const Address = mongoose.model('Address', address);

module.exports = Address;
