'use strict';

const bcrypt = require('bcrypt');

const AbstractService = require('./abstract');

class UserService extends AbstractService {
  list(filter, skip, limit) {
    return this.models.User.find(filter, { password: 0 })
      .skip(skip)
      .limit(limit);
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
        }
      );
    } else {
      return this.models.User.findOneAndUpdate(
        { _id: id },
        {
          user_activities: [userActivityId],
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
        }
      );
    } else {
      return this.models.User.findOneAndUpdate(
        { _id: id },
        {
          user_posts: [userPostId],
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
        }
      );
    } else {
      return this.models.User.findOneAndUpdate(
        { _id: id },
        {
          emergency_contacts: [emergenyContactId],
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
