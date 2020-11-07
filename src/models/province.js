'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const province = new Schema({
  _id: String,
  regionId: { type: String, required: true }
});

const Province = mongoose.model('Province', province);

module.exports = Province;