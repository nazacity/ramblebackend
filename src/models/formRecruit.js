'use strict';

const mongoose = require('mongoose');
const { Schema } = mongoose;

const formRecruit = new Schema({
  form: Schema.Types.ObjectId,
  recruit: Schema.Types.ObjectId,
  draftDate: Date,
  data: Object
});

const FormRecruit = mongoose.model('FormRecruit', formRecruit);

module.exports = FormRecruit;
