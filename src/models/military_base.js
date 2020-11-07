'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const militaryBase = new Schema({
  _id: String,
  path: String,
  isLowest: { type: Boolean, default: false }
});

militaryBase.index({ path: 1 });

const MilitaryBase = mongoose.model('MilitaryBase', militaryBase);

module.exports = MilitaryBase;