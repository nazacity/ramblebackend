'use strict';

const mongoose = require('mongoose');
const { Recruit } = require('.');
const { Schema } = mongoose;

const formRecruit = new Schema({
  formId: Schema.Types.ObjectId,
  recruitId: Schema.Types.ObjectId,
  draftDate: Date,
  data: [{
    prompt: String,
    type: { type: String, enum: ['number', 'boolean', 'string', 'multiSelect', 'select'] },
    answer: Schema.Types.Mixed
  }]
});

const FormRecruit = mongoose.model('FormRecruit', formRecruit);

module.exports = FormRecruit;
