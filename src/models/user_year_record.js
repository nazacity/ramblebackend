'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const user_year_record = new Schema({
  year: { type: String, required: true, default: new Date().getFullYear() },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  activity_number: { type: Number, required: true, default: 0 },
  year_range: { type: Number, required: true, default: 0 },
  year_time: { type: Number, required: true, default: 0 },
  year_speed_average: { type: Number, required: true, default: 0 },
});

user_year_record.index({ user: 1, year: 1 });

const User_Year_Record = mongoose.model('User_Year_Record', user_year_record);

module.exports = User_Year_Record;
