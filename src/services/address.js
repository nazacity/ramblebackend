'use strict';

const AbstractService = require('./abstract');

class AddressService extends AbstractService {
  listUserPosts(filter, skip, limit) {
    return this.models.Address.find(filter).skip(skip).limit(limit);
  }

  findById(id) {
    return this.models.Address.findById(id);
  }

  async createAddress(data) {
    return this.models.Address.create(data);
  }

  async editAddress(id, data) {
    return this.models.Address.findOneAndUpdate(
      { _id: id },
      {
        $set: data,
      }
    );
  }

  async deleteAddress(id) {
    return this.models.Address.findByIdAndRemove(id);
  }
}

module.exports = AddressService;
