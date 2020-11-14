'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const form = new Schema({
  name: { type: String, required: true },
  data: Object
});

const Form = mongoose.model('Form', form);

module.exports = Form;
