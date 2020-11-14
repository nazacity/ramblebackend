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
  address: { type: String, required: true },
  district: { type: String, required: true },
  province: { type: String, required: true, enum: provinceEnum },
  region: { type: String, required: true, enum: regionEnum },

  avatarURL: String,

  // health
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  bmi: { type: Number, required: true },
  bmiGroup: { type: String, required: true },
  drugUse: { type: Boolean, required: true },
  bloodType: { type: String, required: true },

  education: { type: String, required: true },
  placeOfGraduation: { type: String },
  major: String,
  job: String,
  jobIncome: String,
  partTime: String,
  partTimeIncome: String,
  specialAbilities: String,

  base: { type: Schema.Types.ObjectId, required: true, ref: 'MilitaryBase' },
  trainingBase: { type: Schema.Types.ObjectId, required: true, ref: 'MilitaryBase' },
  militaryId: { type: Schema.Types.ObjectId },
  draftDuration: { type: String, required: true, enum: draftDurationEnum },
  draftDate: { type: Date, required: true },
  religion: String
});

const Recruit = mongoose.model('Recruit', recruit);

module.exports = Recruit;
