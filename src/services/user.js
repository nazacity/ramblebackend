'use strict';

const bcrypt = require('bcrypt');
const permission = require('../utils/constants/permission').constant;

const AbstractService = require('./abstract');

class UserService extends AbstractService {
  list (filter, skip, limit) {
    return this.models.User.find(filter, { password: 0 }).skip(skip).limit(limit).populate({
      path: 'base'
    });
  }

  async _preProcessedUser (data) {
    data.username = data.username.toLowerCase();
    data.password = await this.hashPassword(data.password);
    return data;
  }

  async create (data) {
    data = await this._preProcessedUser(data);
    return this.models.User.create(data);
  }

  async edit (id, data) {
    data = await this._preProcessedUser(data);
    return this.models.User.findOneAndUpdate({ _id: id }, {
      $set: data
    });
  }

  async hashPassword (password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  checkPassword (password, hash) {
    return bcrypt.compare(password, hash);
  }

  checkPermission (user, permissionLevel) {
    if (permissionLevel === permission.ADMIN) {
      return user.permission === permission.ADMIN;
    } else if (permissionLevel === permission.EDITOR) {
      return user.permission === permission.ADMIN || 
        user.permission === permission.EDITOR;
    } else {
      return true;
    }
  }
}

module.exports = UserService;
