'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const recruit = new Schema({
  // personal information
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  citizen_id: { type: String, required: true, unique: true },
  date_of_birth: { type: Number, required: true },
  
  // address
  provinceId: { type: String, required: true },
  regionId: { type: String, required: true },

  // health
  height: { type: Number },
  weight: { type: Number },
  adddiction: { type: Boolean, default: false },

  specialAbilities: [String],
  education: { type: String, required: true },
  placeOfGraduation: { type: String, required: true },
  major: String,
  job: String,

  baseId: { type: String, required: true },
  militaryId: { type: String, unique: true },
  draftDuration: { type: String, required: true },
  religion: String
});

const Recruit = mongoose.model('Recruit', recruit);

module.exports = Recruit;