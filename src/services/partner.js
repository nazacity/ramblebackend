'use strict';

const bcrypt = require('bcrypt');

const AbstractService = require('./abstract');

class PartnerService extends AbstractService {
  listPartner(filter, skip, limit) {
    return this.models.Partner.find(filter, { password: 0 })
      .skip(+skip)
      .limit(+limit);
  }

  findById(id) {
    return this.models.Partner.findById(id, { password: 0 }).populate({
      path: 'activities',
    });
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
    return this.models.Partner.findOneAndUpdate(
      { _id: id },
      {
        $set: data,
      }
    );
  }

  async updatePartnerActivity(id, ActivityId) {
    const partner = await this.models.Partner.findById(id);
    if (partner.activities) {
      return this.models.Partner.findOneAndUpdate(
        { _id: id },
        {
          activities: [...partner.activities, ActivityId],
        }
      );
    } else {
      return this.models.Partner.findOneAndUpdate(
        { _id: id },
        {
          activities: [ActivityId],
        }
      );
    }
  }

  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

  checkPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  async partnerRegisterForm(data) {
    return this.models.PartnerRegisterForm.create(data);
  }
}

module.exports = PartnerService;
