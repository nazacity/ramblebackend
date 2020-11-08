'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const form = new Schema({
  name: { type: String, required: true },
  data: [{
    prompt: String,
    type: { type: String, enum: ['number', 'boolean', 'string', 'multiSelect', 'select'] },
    choices: [ String ]
  }]
});

const Form = mongoose.model('Form', form);

module.exports = Form;
