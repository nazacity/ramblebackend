'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const region = new Schema({
  _id: String
});

const Region = mongoose.model('Region', region);

module.exports = Region;