'use strict';

const bcrypt = require('bcrypt');

const AbstractService = require('./abstract');

class PartnerService extends AbstractService {
  listPartner(filter, skip, limit) {
    return this.models.Partner.find(filter, { password: 0 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'base',
      });
  }

  findById(id) {
    return this.models.Partner.findById(id);
  }

  async _preProcessedUser(data) {
    data.username = data.username.toLowerCase();
    data.password = await this.hashPassword(data.password);
    return data;
  }

  async createPartner(data) {
    data = await this._preProcessedUser(data);
    return this.models.Partner.create(data);
  }

  async editPartner(id, data) {
    data = await this._preProcessedUser(data);
    return this.models.Partner.findOneAndUpdate(
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
}

module.exports = PartnerService;
