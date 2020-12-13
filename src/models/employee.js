'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const permissionEnum = require('../utils/constants/employee').enum;
const employee_state = require('../utils/constants/employee').state;

const employee = new Schema({
  username: { type: String, required: true, unqiue: true },
  password: { type: String, required: true },

  // personal information
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  phone_number: { type: String },
  picture_url: { type: String },

  permission: {
    type: String,
    enum: permissionEnum,
    required: true,
    default: 'admin',
  },

  state: {
    type: String,
    enum: employee_state,
    required: true,
    default: 'active',
  },
});

employee.methods.validatePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const Employee = mongoose.model('Employee', employee);

module.exports = Employee;
