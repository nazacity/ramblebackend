'use strict';

const Joi = require('joi');
const express = require('express');
const router = express.Router();
const config = require('../../utils/config');

const { standardize } = require('../../utils/request');
const {
  UserService,
  UserActivityService,
  ActivityService,
  UserPostService,
  EmergencyContactService,
  AddressService,
} = require('../../services');
const { user_gender, blood_type } = require('../../utils/constants/user');

const listUsers = standardize(async (req, res) => {
  const schema = Joi.object({
    firstname: Joi.string(),
    lastname: Joi.string(),

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
      course: {
        title: Joi.string().required(),
        range: Joi.number().required(),
        price: Joi.number().required(),
        course_picture_url: Joi.string().required(),
      },
    },
    size: {
      id: Joi.string().required(),
      size: Joi.string().required(),
      description: Joi.string().required(),
    },

    address: Joi.string().required(),

    emergency_contact: Joi.string().required(),
  });

  const userActivity = Joi.attempt({ user: req.user.id, ...req.body }, schema);

  const newUserActivity = await UserActivityService.createUserActivity(
    userActivity
  );
  const user = await UserService.updateUserActivity(
    req.user.id,
    newUserActivity.id
  );

  await ActivityService.updateUserActivity(
    req.body.activity.id,
    newUserActivity.id,
    user
  );
  res.status(201).send();
});
const getUserByJwt = standardize(async (req, res) => {
  return res.json(req.user);
});

const paymentRequest = standardize(async (req, res) => {
  const schema = Joi.object({
    user: Joi.string().required(), // user id
    activity_title: Joi.string().required(),
  });
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const data = Joi.attempt({ user: req.user.id, ...req.body }, schema);

  const { id } = Joi.attempt(req.params, paramSchema);

  try {
    const scbRes = await axios({
      method: 'post',
      url: `https://api-sandbox.partners.scb/partners/sandbox/v1/oauth/token`,
      headers: {
        'Content-Type': 'application/json',
        resourceOwnerId: config.scb.key,
        requestUId: orderId,
      },
      data: {
        applicationKey: config.scb.key,
        applicationSecret: config.scb.secret,
        authCode: '',
      },
    });

    const accessToken = scbRes.data.data.accessToken;

    const qrcodeRes = await axios({
      method: 'post',
      url: `https://api-sandbox.partners.scb/partners/sandbox/v1/payment/qrcode/create`,
      headers: {
        'Content-Type': 'application/json',
        resourceOwnerId: config.scb.key,
        requestUId: id,
        authorization: `Bearer ${accessToken}`,
      },
      data: {
        qrType: 'PP',
        ppType: 'BILLERID',
        ppId: '199101400833647',
        amount: amount,
        ref1: id.substring(0, 5).toUpperCase(),
        ref2: id.substring(5).toUpperCase(),
        ref3: data.activity_title.substring(0, 20),
      },
    });

    return res.status(200).send(qrcodeRes.data);
  } catch (error) {
    console.log('error: ', error);
  }
});

router.get('/getuserbyjwt', getUserByJwt);
router.post('/createuseractivity', createUserActivity);
router.post('/confirmpayment/:id', paymentRequest);

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
    relationship: Joi.string().required(),
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

const createAddress = standardize(async (req, res) => {
  const schema = Joi.object({
    address: Joi.string().required(),
    province: Joi.string().required(),
    zip: Joi.string().required(),
    phone_number: Joi.string().required(),
  });

  const address = Joi.attempt({ ...req.body }, schema);

  const data = await AddressService.createAddress(address);

  res.status(201).send({
    status: 201,
    data: await UserService.updateAddress(req.user.id, data.id),
  });
});

const deleteAddress = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, paramSchema);

  await UserService.deleteAddress(req.user.id, id);
  res.json(await AddressService.deleteAddress(id));
});
router.post('/createaddress', createAddress);
router.delete('/deleteaddress/:id', deleteAddress);

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

const listPromoteActivities = standardize(async (req, res) => {
  const schema = Joi.object({
    skip: Joi.string().default(0),
    limit: Joi.string().default(5),
  });

  const filter = Joi.attempt(req.query, schema);
  const { skip, limit } = filter;

  delete filter.skip;
  delete filter.limit;

  res.json({
    status: 200,
    data: await ActivityService.listPromoteActivity(filter, skip, limit),
  });
});

const getActivityById = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, paramSchema);

  res
    .status(200)
    .send({ status: 200, data: await ActivityService.findById(id) });
});

router.get('/getactivities', listActivities);
router.get('/getactivity/:id', getActivityById);
router.get('/getpromoteactivities', listPromoteActivities);

module.exports = router;
