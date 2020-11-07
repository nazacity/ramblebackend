'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const militaryBase = new Schema({
  name: { type: String, required: true, unique: true },
  path: String,
  isLowest: { type: Boolean, default: false }
});

militaryBase.index({ name: 1, unique: true });
militaryBase.index({ path: 1 });
militaryBase.index({ isLowest: 1 });

const MilitaryBase = mongoose.model('MilitaryBase', militaryBase);

module.exports = MilitaryBase;
