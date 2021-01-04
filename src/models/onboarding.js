'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const onboarding = new Schema({
  title: { type: String, require: true },
  subtitle_th: { type: String, require: true },
  description_th: { type: String, require: true },
  subtitle_en: { type: String, require: true },
  description_en: { type: String, require: true },
  color: { type: String, require: true },
  picture: { type: String, require: true },
  createdAt: { type: Date, default: new Date() },
});

const Onboarding = mongoose.model('Onboarding', onboarding);

module.exports = Onboarding;
