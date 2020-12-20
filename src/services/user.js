'use strict';

const bcrypt = require('bcrypt');

const AbstractService = require('./abstract');

class UserService extends AbstractService {
  listUsers(filter, skip, limit) {
    return this.models.User.find(
      {
        display_name: filter.display_name ? filter.display_name : { $ne: null },
        first_name: filter.first_name ? filter.first_name : { $ne: null },
        last_name: filter.last_name ? filter.last_name : { $ne: null },
        gender: filter.gender ? filter.gender : { $ne: null },
        age: {
          $gte: filter.min_age ? filter.min_age : 0,
          $lte: filter.max_age ? filter.max_age : 100,
        },
      },
      { password: 0 }
    )
      .skip(+skip)
      .limit(+limit);
  }

  findById(id) {
    return this.models.User.findById(id, { password: 0 });
  }

  async _preProcessedUser(data) {
    data.username = data.username.toLowerCase();
    data.password = await this.hashPassword(data.password);
    return data;
  }

  async create(data) {
    data = await this._preProcessedUser(data);
    return this.models.User.create(data);
  }

  async edit(id, data) {
    data = await this._preProcessedUser(data);
    return this.models.User.findOneAndUpdate(
      { _id: id },
      {
        ...data,
      }
    );
  }

  async updateUserActivity(id, userActivityId) {
    const user = await this.models.User.findById(id);
    if (user.user_activities) {
      return this.models.User.findOneAndUpdate(
        { _id: id },
        {
          user_activities: [...user.user_activities, userActivityId],
        },
        {
          new: true,
        }
      );
    } else {
      return this.models.User.findOneAndUpdate(
        { _id: id },
        {
          user_activities: [userActivityId],
        },
        {
          new: true,
        }
      );
    }
  }

  async updateUserPost(id, userPostId) {
    const user = await this.models.User.findById(id);
    if (user.user_posts) {
      return this.models.User.findOneAndUpdate(
        { _id: id },
        {
          user_posts: [...user.user_posts, userPostId],
        },
        {
          new: true,
        }
      );
    } else {
      return this.models.User.findOneAndUpdate(
        { _id: id },
        {
          user_posts: [userPostId],
        },
        {
          new: true,
        }
      );
    }
  }

  async updateEmergencyContact(id, emergenyContactId) {
    const user = await this.models.User.findById(id);
    if (user.emergency_contacts) {
      return this.models.User.findOneAndUpdate(
        { _id: id },
        {
          emergency_contacts: [...user.emergency_contacts, emergenyContactId],
        },
        {
          new: true,
        }
      );
    } else {
      return this.models.User.findOneAndUpdate(
        { _id: id },
        {
          emergency_contacts: [emergenyContactId],
        },
        {
          new: true,
        }
      );
    }
  }

  async deleteEmergencyContact(id, emergenyContactId) {
    const user = await this.models.User.findById(id);

    if (user.emergency_contacts) {
      const newEmergencyContacts = user.emergency_contacts.filter(
        (item) => item.toString() !== emergenyContactId.toString()
      );
      return this.models.User.findOneAndUpdate(
        { _id: id },
        {
          emergency_contacts: newEmergencyContacts,
        },
        {
          new: true,
        }
      );
    } else {
      return user;
    }
  }

  async updateAddress(id, addressesId) {
    const user = await this.models.User.findById(id);
    if (user.addresses) {
      return this.models.User.findOneAndUpdate(
        { _id: id },
        {
          addresses: [...user.addresses, addressesId],
        },
        {
          new: true,
        }
      );
    } else {
      return this.models.User.findOneAndUpdate(
        { _id: id },
        {
          addresses: [addressesId],
        },
        {
          new: true,
        }
      );
    }
  }

  async deleteAddress(id, addressesId) {
    const user = await this.models.User.findById(id);

    if (user.addresses) {
      const newAddresses = user.addresses.filter(
        (item) => item.toString() !== addressesId.toString()
      );
      return this.models.User.findOneAndUpdate(
        { _id: id },
        {
          addresses: newAddresses,
        },
        {
          new: true,
        }
      );
    } else {
      return user;
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
}

module.exports = UserService;
