'use strict';

const Joi = require('joi');
const express = require('express');
const router = express.Router();

const {
  constant: permission,
  enum: permissionEnum,
} = require('../../utils/constants/employee');
const { standardize } = require('../../utils/request');
const partnerState = require('../../utils/constants/partner').partner_state;
const activityStateEnum = require('../../utils/constants/activity')
  .activity_state;
const {
  EmployeeService,
  PartnerService,
  ActivityService,
  UserService,
} = require('../../services');

const listEmployees = standardize(async (req, res) => {
  const schema = Joi.object({
    username: Joi.string(),

    first_name: Joi.string(),
    last_name: Joi.string(),
    phone_number: Joi.string().required(),

    permission: Joi.string().valid(...permissionEnum),

    skip: Joi.string().default(0),
    limit: Joi.string().default(25),
  });

  const filter = Joi.attempt(req.query, schema);
  const { skip, limit } = filter;

  delete filter.skip;
  delete filter.limit;

  res.json(await EmployeeService.listEmployee(filter, skip, limit));
}, permission.ADMIN);

// Employee

const createEmployee = standardize(async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone_number: Joi.string().required(),
    picture_url: Joi.string().required(),
    permission: Joi.string()
      .valid(...permissionEnum)
      .required(),
  });

  const user = Joi.attempt(req.body, schema);
  await EmployeeService.createEmployee(user);
  res.status(201).send();
}, permission.ADMIN);

const editEmployee = standardize(async (req, res) => {
  const schema = Joi.object({
    permission: Joi.string(),
  });
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const user = Joi.attempt(req.body, schema);
  const { id } = Joi.attempt(req.params, paramSchema);
  res.json(await EmployeeService.editEmployee(id, user));
}, permission.ADMIN);

const getEmployeeByJwt = standardize(async (req, res) => {
  return res.json(req.user);
});

router.get('/getemployeebyjwt', getEmployeeByJwt);
router.get('/getemployees', listEmployees);
router.post('/createemployee', createEmployee);
router.post('/editemployee/:id', editEmployee);

// Partner

const listPartners = standardize(async (req, res) => {
  const schema = Joi.object({
    username: Joi.string(),

    display_name: Joi.string(),

    skip: Joi.string().default(0),
    limit: Joi.string().default(25),
  });

  const filter = Joi.attempt(req.query, schema);
  const { skip, limit } = filter;

  delete filter.skip;
  delete filter.limit;

  res.json(await PartnerService.listPartner(filter, skip, limit));
}, permission.ADMIN);

const createPartner = standardize(async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    display_name: Joi.string().required(),
  });

  const partner = Joi.attempt(req.body, schema);
  await PartnerService.createPartner(partner);
  res.status(201).send();
}, permission.ADMIN);

const editPartner = standardize(async (req, res) => {
  const schema = Joi.object({
    permission: Joi.string(),
  });
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const user = Joi.attempt(req.body, schema);
  const { id } = Joi.attempt(req.params, paramSchema);
  res.json(await PartnerService.editPartner(id, user));
}, permission.ADMIN);

const getPartnerById = standardize(async (req, res) => {
  const schema = Joi.object({
    permission: Joi.string(),
  });
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, paramSchema);

  res.json(await PartnerService.findById(id));
}, permission.ADMIN);

router.get('/getpartners', listPartners);
router.get('/getpartner/:id', getPartnerById);
router.post('/createpartner', createPartner);
router.post('/editpartner/:id', editPartner);

// User

const listUsers = standardize(async (req, res) => {
  const schema = Joi.object({
    first_name: Joi.string(),
    last_name: Joi.string(),
    display_name: Joi.string(),
    gender: Joi.string(),
    min_age: Joi.string(),
    max_age: Joi.string(),

    skip: Joi.string().default(0),
    limit: Joi.string().default(25),
  });

  const filter = Joi.attempt(req.query, schema);
  const { skip, limit } = filter;

  delete filter.skip;
  delete filter.limit;

  res.json(await UserService.listUsers(filter, skip, limit));
}, permission.ADMIN);

const editUser = standardize(async (req, res) => {
  const schema = Joi.object({
    permission: Joi.string(),
  });
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const user = Joi.attempt(req.body, schema);
  const { id } = Joi.attempt(req.params, paramSchema);
  res.json(await UserService.editUser(id, user));
}, permission.ADMIN);

router.get('/getusers', listUsers);
router.post('/edituser/:id', editUser);

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

const createActivity = standardize(async (req, res) => {
  const schema = Joi.object({
    partner: Joi.string().required(),
    activity_picture_url: Joi.string().required(),
    title: Joi.string().required(),
    sub_title: Joi.string().required(),
    description: Joi.string().required(),
    location: {
      lat: Joi.number().required(),
      lng: Joi.number().required(),
      province: Joi.string().required(),
      place_name: Joi.string().required(),
    },
    actual_date: Joi.date().required(),
    register_start_date: Joi.date().required(),
    register_end_date: Joi.date().required(),
    courses: [
      {
        id: { type: String, required: true },
        title: Joi.string().required(),
        range: Joi.number().required(),
        price: Joi.number().required(),
        course_picture_url: Joi.string().required(),
      },
    ],
    timeline: [
      {
        id: Joi.string().required(),
        time: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
      },
    ],
    rules: [
      {
        id: Joi.string().required(),
        title: Joi.string().required(),
        detail: [
          {
            id: Joi.string().required(),
            description: Joi.string().required(),
          },
        ],
      },
    ],
    more_detail: [
      {
        id: Joi.string().required(),
        title: Joi.string().required(),
      },
    ],
    shirt_detail: [
      {
        id: Joi.string().required(),
        style: Joi.string().required(),
        shirt_picturl_url: Joi.string().required(),
      },
    ],
    size: [
      {
        id: Joi.string().required(),
        size: Joi.string().required(),
      },
    ],
    condition: [
      {
        id: Joi.string().required(),
        description: Joi.string().required(),
      },
    ],
  });

  const data = Joi.attempt(req.body, schema);
  await ActivityService.createActivity(data);
  res.status(201).send();
}, permission.ADMIN);

const editActivity = standardize(async (req, res) => {
  const schema = Joi.object({
    permission: Joi.string(),
  });
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const data = Joi.attempt(req.body, schema);
  const { id } = Joi.attempt(req.params, paramSchema);
  res.json(await ActivityService.editActivity(id, data));
}, permission.ADMIN);

router.get('/getactivities', listActivities);
router.post('/createactivity', createActivity);
router.post('/editactivity/:id', editActivity);

module.exports = router;
