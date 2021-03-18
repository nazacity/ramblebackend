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
        'vefiry_information.state': filter.identity_state
          ? filter.identity_state
          : { $ne: '' },
        'vefiry_vaccine.state': filter.vaccine_state
          ? filter.vaccine_state
          : { $ne: '' },
      },
      { password: 0 }
    )
      .skip(+skip)
      .limit(+limit)
      .populate({ path: 'addresses' })
      .populate({ path: 'emergency_contacts' })
      .populate({ path: 'user_records' })
      .populate({
        path: 'user_posts',
        populate: {
          path: 'activity',
          select: {
            activity_picture_url: 1,
            title: 1,
            actual_date: 1,
            state: 1,
          },
        },
      })
      .populate({
        path: 'user_activities',
        populate: {
          path: 'activity.id',
          select: {
            activity_picture_url: 1,
            title: 1,
            actual_date: 1,
            state: 1,
          },
        },
      });
  }

  async findByLineId(lineId, pictureUrl) {
    const user = await this.models.User.findOneAndUpdate(
      { lineId: lineId },
      {
        $set: {
          user_picture_url: pictureUrl,
        },
      }
    )
      .populate({ path: 'addresses' })
      .populate({ path: 'emergency_contacts' })
      .populate({ path: 'user_records' })
      .populate({
        path: 'user_posts',
        populate: {
          path: 'activity',
          select: {
            activity_picture_url: 1,
            title: 1,
            actual_date: 1,
            state: 1,
          },
        },
      })
      .populate({
        path: 'user_activities',
        populate: {
          path: 'activity.id',
          select: {
            activity_picture_url: 1,
            title: 1,
            actual_date: 1,
            state: 1,
          },
        },
      });
    if (user) {
      return user;
    } else {
      return 'No user is found';
    }
  }

  async lineConnect(user_id, lineId) {
    const checkUser = await this.models.User.findOne({
      lineId: lineId,
    });
    if (checkUser) {
      return 'This line account was used';
    } else {
      const user = await this.models.User.findByIdAndUpdate(
        user_id,
        {
          $set: {
            lineId: lineId,
          },
        },
        {
          new: true,
        }
      )
        .populate({ path: 'addresses' })
        .populate({ path: 'emergency_contacts' })
        .populate({ path: 'user_records' })
        .populate({
          path: 'user_posts',
          populate: {
            path: 'activity',
            select: {
              activity_picture_url: 1,
              title: 1,
              actual_date: 1,
              state: 1,
            },
          },
        })
        .populate({
          path: 'user_activities',
          populate: {
            path: 'activity.id',
            select: {
              activity_picture_url: 1,
              title: 1,
              actual_date: 1,
              state: 1,
            },
          },
        });
      if (user) {
        return user;
      } else {
        return 'User is not found';
      }
    }
  }

  findAllUser(filter) {
    return this.models.User.find(
      {
        gender: filter.gender ? filter.gender : { $ne: null },
        age: {
          $gte: filter.min_age ? filter.min_age : 0,
          $lte: filter.max_age ? filter.max_age : 100,
        },
      },
      { password: 0 }
    ).count();
  }

  findById(id) {
    return this.models.User.findById(id, { password: 0 });
  }

  async updateDeviceToken(id, device_token, birthday) {
    return this.models.User.findByIdAndUpdate(id, {
      $set: {
        device_token: device_token,
      },
    });
  }

  async _preProcessedUser(data) {
    data.username = data.username.toLowerCase();
    data.password = await this.hashPassword(data.password);
    return data;
  }

  async create(data) {
    const user = await this.models.User.findOne({
      $or: [{ username: data.username }],
    });
    if (user) {
      return 'Username is used';
    }
    data = await this._preProcessedUser(data);
    const newUser = await this.models.User.create(data);
    const useryearrecord = await this.models.UserYearRecord.create({
      user: newUser._id,
    });
    await this.models.User.findByIdAndUpdate(newUser._id, {
      $set: {
        user_records: [useryearrecord._id],
      },
    });
    return newUser;
  }

  async createUserWithApple(data) {
    const newUser = await this.models.User.create({
      ...data,
      display_name: data.first_name + ' ' + data.last_name,
    });
    const useryearrecord = await this.models.UserYearRecord.create({
      $set: {
        user: newUser._id,
      },
    });
    await this.models.User.findByIdAndUpdate(newUser._id, {
      $set: {
        user_records: [useryearrecord._id],
      },
    });
    return newUser;
  }

  async edit(id, data) {
    // data = await this._preProcessedUser(data);
    return this.models.User.findOneAndUpdate(
      { _id: id },
      {
        $set: data,
      },
      {
        new: true,
      }
    )
      .populate({ path: 'addresses' })
      .populate({ path: 'emergency_contacts' })
      .populate({ path: 'user_records' })
      .populate({
        path: 'user_posts',
        populate: {
          path: 'activity',
          select: {
            activity_picture_url: 1,
            title: 1,
            actual_date: 1,
            state: 1,
          },
        },
      })
      .populate({
        path: 'user_activities',
        populate: {
          path: 'activity.id',
          select: {
            activity_picture_url: 1,
            title: 1,
            actual_date: 1,
            state: 1,
          },
        },
      });
  }

  async changePassword(id, data) {
    const new_password = await this.hashPassword(data.new_password);
    const user = await this.models.User.findById(id);

    if (await user.validatePassword(data.old_password)) {
      return this.models.User.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            password: new_password,
          },
        },
        {
          new: true,
        }
      );
    } else {
      return 'Password is incorrect';
    }
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

  async forgotPassword(user) {
    const { username, phone_number } = user;

    const getUser = await this.models.User.findOne(
      {
        username,
        phone_number,
      },
      { phone_number: 1 }
    );
    if (getUser) {
      return getUser._id;
    } else {
      return 'No user is found';
    }
  }

  async resetPassword(id, password) {
    const hasdPassword = await this.hashPassword(password);
    const user = await this.models.User.findByIdAndUpdate(
      id,
      {
        $set: {
          password: hasdPassword,
        },
      },
      { new: true }
    );
    if (user) {
      return 'Changed password successfully';
    } else {
      return 'No user is found';
    }
  }

  async updateIdentityState(id, data) {
    return this.models.User.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          idcard: 'not provided yet',
          vefiry_information: {
            id_card_piture_url: data.id_card_piture_url,
            id_card_with_person_piture_url: data.id_card_with_person_piture_url,
            state: data.state,
          },
        },
      },
      {
        new: true,
      }
    )
      .populate({ path: 'addresses' })
      .populate({ path: 'emergency_contacts' })
      .populate({ path: 'user_records' })
      .populate({
        path: 'user_posts',
        populate: {
          path: 'activity',
          select: {
            activity_picture_url: 1,
            title: 1,
            actual_date: 1,
            state: 1,
          },
        },
      })
      .populate({
        path: 'user_activities',
        populate: {
          path: 'activity.id',
          select: {
            activity_picture_url: 1,
            title: 1,
            actual_date: 1,
            state: 1,
          },
        },
      });
  }

  async updateVaccineState(id, data) {
    return this.models.User.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          vefiry_vaccine: {
            vaccine_confirm_piture_url: data.vaccine_confirm_piture_url,
            state: data.state,
          },
        },
      },
      {
        new: true,
      }
    )
      .populate({ path: 'addresses' })
      .populate({ path: 'emergency_contacts' })
      .populate({ path: 'user_records' })
      .populate({
        path: 'user_posts',
        populate: {
          path: 'activity',
          select: {
            activity_picture_url: 1,
            title: 1,
            actual_date: 1,
            state: 1,
          },
        },
      })
      .populate({
        path: 'user_activities',
        populate: {
          path: 'activity.id',
          select: {
            activity_picture_url: 1,
            title: 1,
            actual_date: 1,
            state: 1,
          },
        },
      });
  }
}

module.exports = UserService;
