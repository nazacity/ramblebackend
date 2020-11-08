'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const draftDurationEnum = require('../utils/constants/draft_duration').enum;
const { provinceEnum, regionEnum } = require('../utils/constants/provinces');

const recruit = new Schema({
  // personal information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  citizenId: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date, required: true },
  
  // address
  province: { type: String, required: true, enum: provinceEnum },
  region: { type: String, required: true, enum: regionEnum },

  // health
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  bmi: { type: Number, required: true },

  specialAbilities: [String],
  education: { type: String, required: true },
  placeOfGraduation: { type: String },
  major: String,
  job: String,

  baseId: { type: Schema.Types.ObjectId, required: true },
  militaryId: { type: Schema.Types.ObjectId, unique: true },
  draftDuration: { type: String, required: true, enum: draftDurationEnum },
  draftDate: { type: Date, required: true },
  religion: String
});

const Recruit = mongoose.model('Recruit', recruit);

module.exports = Recruit;
