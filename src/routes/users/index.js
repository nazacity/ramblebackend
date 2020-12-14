'use strict';

const Joi = require('joi');
const express = require('express');
const router = express.Router();

const { standardize } = require('../../utils/request');
const {
  UserService,
  UserActivityService,
  ActivityService,
  UserPostService,
  EmergencyContactService,
} = require('../../services');
const { user_gender, blood_type } = require('../../utils/constants/user');

const listUsers = standardize(async (req, res) => {
  const schema = Joi.object({
    username: Joi.string(),

    firstname: Joi.string(),
    lastname: Joi.string(),

    base: Joi.string(),

    skip: Joi.string().default(0),
    limit: Joi.string().default(25),
  });

  const filter = Joi.attempt(req.query, schema);
  const { skip, limit } = filter;

  delete filter.skip;
  delete filter.limit;

  res.json(await UserService.list(filter, skip, limit));
});

const createUser = standardize(async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),

    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    birthday: Joi.date().required(),
    gender: Joi.string()
      .valid(...user_gender)
      .required(),
    blood_type: Joi.string()
      .valid(...blood_type)
      .required(),
    id_card_no: Joi.string().required(),
    user_picture_url: Joi.string().required(),
  });

  const user = Joi.attempt(req.body, schema);
  await UserService.create(user);
  res.status(201).send();
});

const editUser = standardize(async (req, res) => {
  const schema = Joi.object({
    permission: Joi.string(),
  });
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const user = Joi.attempt(req.body, schema);
  const { id } = Joi.attempt(req.params, paramSchema);
  res.json(await UserService.edit(id, user));
});

router.get('/getusers', listUsers);
router.post('/createuser', createUser);
router.post('/edituser/:id', editUser);

// User Activity
const createUserActivity = standardize(async (req, res) => {
  const schema = Joi.object({
    user: Joi.string().required(), // user id
    activity: {
      id: Joi.string().required(), // activity id
      activity_picture_url: Joi.string().required(),
      actual_date: Joi.date().required(),
      title: Joi.string().required(),
      sub_title: Joi.string().required(),
      location: {
        lat: Joi.number().required(),
        lng: Joi.number().required(),
        province: Joi.string().required(),
        place_name: Joi.string().required(),
      },
      course: {
        title: Joi.string().required(),
        range: Joi.number().required(),
        price: Joi.number().required(),
        course_picture_url: Joi.string().required(),
      },
    },

    shirt_detail: {
      style: Joi.string().required(),
      shirt_picturl_url: Joi.string().required(),
      size: Joi.string().required(),
    },
    address: {
      address: Joi.string().required(),
      province: Joi.string().required(),
      zip: Joi.string().required(),
    },
  });

  const userActivity = Joi.attempt({ user: req.user.id, ...req.body }, schema);

  const newUserActivity = await UserActivityService.createUserActivity(
    userActivity
  );
  await UserService.updateUserActivity(req.user.id, newUserActivity.id);

  await ActivityService.updateUserActivity(
    req.body.activity.id,
    newUserActivity.id
  );
  res.status(201).send();
});

router.post('/createuseractivity', createUserActivity);

// User Post
const createUserPost = standardize(async (req, res) => {
  const schema = Joi.object({
    form_team: Joi.boolean().required(),
    share_accommodation: Joi.boolean().required(),
    share_transportaion: Joi.boolean().required(),
    share_trip: Joi.boolean().required(),
    male: Joi.boolean().required(),
    female: Joi.boolean().required(),
    activity: Joi.string().required(),
    user: Joi.string().required(),
    description: Joi.string().required(),
    province: Joi.string().required(),
  });

  const userPost = Joi.attempt({ user: req.user.id, ...req.body }, schema);

  const newUserPost = await UserPostService.createUserPost(userPost);
  await UserService.updateUserPost(req.user.id, newUserPost.id);

  res.status(201).send();
});

const listUserPosts = standardize(async (req, res) => {
  const schema = Joi.object({
    form_team: Joi.boolean(),
    share_accommodation: Joi.boolean(),
    share_transportaion: Joi.boolean(),
    share_trip: Joi.boolean(),
    male: Joi.boolean(),
    female: Joi.boolean(),
    activity: Joi.string(),
    province: Joi.string(),

    skip: Joi.string().default(0),
    limit: Joi.string().default(25),
  });

  const filter = Joi.attempt(req.query, schema);
  const { skip, limit } = filter;

  delete filter.skip;
  delete filter.limit;

  res.json(await UserPostService.listUserPosts(filter, skip, limit));
});

router.get('/getuserposts', listUserPosts);
router.post('/createuserpost', createUserPost);

// Emergency Contact
const createEmergencyContact = standardize(async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    phone_number: Joi.string().required(),
    relation: Joi.string().required(),
  });

  const emergencyContact = Joi.attempt({ ...req.body }, schema);

  const newEmergencyContact = await EmergencyContactService.createEmergencyContact(
    emergencyContact
  );
  await UserService.updateEmergencyContact(req.user.id, newEmergencyContact.id);

  res.status(201).send();
});

const deleteEmergencyContact = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, paramSchema);

  await UserService.deleteEmergencyContact(req.user.id, id);
  res.json(await EmergencyContactService.deleteEmergencyContact(id));
});

router.post('/createemergencycontact', createEmergencyContact);
router.delete('/deleteemergencycontact/:id', deleteEmergencyContact);

// Activity
const listActivities = standardize(async (req, res) => {
  const schema = Joi.object({
    title: Joi.string(),

    region: Joi.string(),
    province: Joi.string(),

    from: Joi.date(),
    to: Joi.date().greater(Joi.ref('from')),

    range_min: Joi.number(),
    range_max: Joi.number().greater(Joi.ref('range_min')),

    skip: Joi.string().default(0),
    limit: Joi.string().default(25),
  });

  const filter = Joi.attempt(req.query, schema);
  const { skip, limit } = filter;

  delete filter.skip;
  delete filter.limit;

  res.json(await ActivityService.listActivity(filter, skip, limit));
});

router.get('/getactivities', listActivities);

module.exports = router;
