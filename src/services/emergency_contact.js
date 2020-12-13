'use strict';

const AbstractService = require('./abstract');

class EmergencyContactService extends AbstractService {
  listEmergencyContacts(filter, skip, limit) {
    return this.models.UserPost.find(filter).skip(skip).limit(limit);
  }

  findById(id) {
    return this.models.EmergencyContact.findById(id);
  }

  async createEmergencyContact(data) {
    return this.models.EmergencyContact.create(data);
  }

  async editEmergencyContact(id, data) {
    return this.models.EmergencyContact.findOneAndUpdate(
      { _id: id },
      {
        ...data,
      }
    );
  }

  async deleteEmergencyContact(id) {
    return this.models.EmergencyContact.findByIdAndRemove(id);
  }
}

module.exports = EmergencyContactService;
