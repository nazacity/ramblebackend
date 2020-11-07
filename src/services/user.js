'use strict';

const bcrypt = require('bcrypt');

const AbstractService = require('./abstract');

class UserService extends AbstractService {
  async create (data) {
    data.password = await this.hashPassword(data.password);
    return this.models.User.create(data);
  }

  async hashPassword (password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  checkPassword (password, hash) {
    return bcrypt.compare(password, hash);
  }

  async list (filter, skip, limit) {
    await this.models.User.find({
      
    });
  }
}

module.exports = UserService;
