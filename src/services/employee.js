'use strict';

const bcrypt = require('bcrypt');
const permission = require('../utils/constants/employee').constant;

const AbstractService = require('./abstract');

class EmployeeService extends AbstractService {
  listEmployee(filter, skip, limit) {
    return this.models.Employee.find(filter, { password: 0 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'base',
      });
  }

  async _preProcessedUser(data) {
    data.username = data.username.toLowerCase();
    data.password = await this.hashPassword(data.password);
    return data;
  }

  async createEmployee(data) {
    data = await this._preProcessedUser(data);
    return this.models.Employee.create(data);
  }

  async editEmployee(id, data) {
    data = await this._preProcessedUser(data);
    return this.models.Employee.findOneAndUpdate(
      { _id: id },
      {
        ...data,
      }
    );
  }

  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  checkPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  checkPermission(user, permissionLevel) {
    if (permissionLevel === permission.ADMIN) {
      return user.permission === permission.ADMIN;
    } else if (permissionLevel === permission.EMPLOYEE) {
      return (
        user.permission === permission.ADMIN ||
        user.permission === permission.EMPLOYEE
      );
    } else {
      return true;
    }
  }
}

module.exports = EmployeeService;
