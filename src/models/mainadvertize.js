'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const mainAdvertize = new Schema(
  {
    advertize_picture_url: { type: String, require: true },
    uri: { type: String, require: true },
    createdAt: { type: Date, default: new Date() },
  },
  { timestamps: true }
);

const MainAdvertize = mongoose.model('MainAdvertize', mainAdvertize);

module.exports = MainAdvertize;
