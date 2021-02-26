'use strict';

const AbstractService = require('./abstract');

class UserPostService extends AbstractService {
  listFilteredUserPosts(filter, skip, limit, user_post_ids) {
    return this.models.UserPost.find({
      _id: { $nin: user_post_ids },
      form_team: filter.form_team ? true : { $ne: null },
      share_accommodation: filter.share_accommodation ? true : { $ne: null },
      share_transportation: filter.share_transportation ? true : { $ne: null },
      share_trip: filter.share_trip ? true : { $ne: null },
      male: filter.male ? true : { $ne: null },
      female: filter.female ? true : { $ne: null },
      activity: filter.activity ? filter.activity : { $ne: null },
      state: 'finding',
    })
      .populate({
        path: 'user',
        select: {
          display_name: 1,
          user_picture_url: 1,
        },
      })
      .skip(skip)
      .limit(limit);
  }

  listUserPostsByActivity(filter, skip, limit, user_post_ids) {
    return this.models.UserPost.find({
      _id: { $nin: user_post_ids },
      state: 'finding',
      activity: filter.activity,
    })
      .populate({
        path: 'user',
        select: {
          display_name: 1,
          user_picture_url: 1,
        },
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
    return this.models.UserPost.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
  }

  async changeUserPostState(id, data) {
    return this.models.UserPost.findByIdAndUpdate(
      id,
      {
        $set: {
          state: data.state,
        },
      },
      { new: true }
    );
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
