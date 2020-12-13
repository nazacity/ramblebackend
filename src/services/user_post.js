'use strict';

const AbstractService = require('./abstract');

class UserPostService extends AbstractService {
  listUserPosts(filter, skip, limit) {
    return this.models.UserPost.find({
      form_team: filter.form_team ? true : { $ne: null },
      share_accommodation: filter.share_accommodation ? true : { $ne: null },
      share_transportaion: filter.share_transportaion ? true : { $ne: null },
      share_trip: filter.share_trip ? true : { $ne: null },
      male: filter.male ? true : { $ne: null },
      female: filter.female ? true : { $ne: null },
      activity: filter.activity ? filter.activity : { $ne: null },
      province: filter.province ? filter.province : { $ne: null },
    })
      .skip(skip)
      .limit(limit);
  }

  findById(id) {
    return this.models.UserPost.findById(id);
  }

  async createUserPost(data) {
    return this.models.UserPost.create(data);
  }

  async editUserPost(id, data) {
    return this.models.UserPost.findOneAndUpdate(
      { _id: id },
      {
        $set: data,
      }
    );
  }
}

module.exports = UserPostService;
