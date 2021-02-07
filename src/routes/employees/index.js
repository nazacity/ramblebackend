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
  MainAdvertizeService,
  OnboardingService,
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
    state: Joi.string().required(),
  });
  const paramSchema = Joi.object({
    id: Joi.string(),
  });

  const data = Joi.attempt(req.body, schema);
  const { id } = Joi.attempt(req.params, paramSchema);

  res
    .status(200)
    .json({ status: 200, data: await PartnerService.editPartner(id, data) });
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

  res.status(200).send({
    status: 200,
    data: await ActivityService.listActivity(filter, skip, limit),
  });
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
    courses: Joi.array().items({
      id: Joi.string().required(),
      title: Joi.string().required(),
      range: Joi.number().required(),
      price: Joi.number().required(),
      course_picture_url: Joi.string().required(),
    }),

    timeline: Joi.array().items({
      id: Joi.string().required(),
      time: Joi.string().required(),
      title: Joi.string().required(),
      description: Joi.string().allow(''),
    }),
    rules: Joi.array().items({
      id: Joi.string().required(),
      title: Joi.string().required(),
      detail: Joi.array().items({
        id: Joi.string().allow(''),
        description: Joi.string().allow(''),
      }),
    }),
    rules1: Joi.string().required(),
    more_detail: Joi.string().required(),
    shirt_detail: Joi.array().items({
      id: Joi.string().required(),
      style: Joi.string().required(),
      shirt_picturl_url: Joi.string().required(),
    }),
    size: Joi.array().items({
      id: Joi.string().required(),
      size: Joi.string().required(),
      description: Joi.string().allow(''),
    }),
    condition: Joi.string().required(),
    gifts: Joi.array().items({
      id: Joi.string(),
      description: Joi.string().allow(''),
      gift_picture_url: Joi.string().allow(''),
    }),
    senderAddress: {
      name: Joi.string().required(),
      address: Joi.string().required(),
      province: Joi.string().required(),
      zip: Joi.string().required(),
      phone_number: Joi.string().required(),
    },
    contact: {
      phone_number: Joi.string().required(),
      line: Joi.string().required(),
    },
  });

  const data = Joi.attempt(req.body, schema);
  if (req.body.gifts.length === 0) {
    delete data.gifts;
  }
  const resData = await ActivityService.createActivity(data);
  await PartnerService.updatePartnerActivity(data.partner, resData.id);
  res.status(201).send({ status: 201, data: resData });
}, permission.ADMIN);

const editActivity = standardize(async (req, res) => {
  let schema;
  const request = { ...req.body };
  delete request.type;

  if (req.body.type === 'banner') {
    schema = Joi.object({
      activity_picture_url: Joi.string().required(),
    });
  } else if (req.body.type === 'title') {
    schema = Joi.object({
      title: Joi.string().required(),
      sub_title: Joi.string().required(),
      description: Joi.string().required(),
    });
  } else if (req.body.type === 'location') {
    schema = Joi.object({
      location: {
        lat: Joi.number().required(),
        lng: Joi.number().required(),
        province: Joi.string().required(),
        place_name: Joi.string().required(),
      },
    });
  } else if (req.body.type === 'dateinfo') {
    schema = Joi.object({
      actual_date: Joi.date().required(),
      register_start_date: Joi.date().required(),
      register_end_date: Joi.date().required(),
    });
  } else if (req.body.type === 'courses') {
    schema = Joi.object({
      courses: Joi.array().items({
        id: Joi.string().required(),
        title: Joi.string().required(),
        range: Joi.number().required(),
        price: Joi.number().required(),
        course_picture_url: Joi.string().required(),
      }),
    });
  } else if (req.body.type === 'timeline') {
    schema = Joi.object({
      timeline: Joi.array().items({
        id: Joi.string().required(),
        time: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().allow(''),
      }),
    });
  } else if (req.body.type === 'gifts') {
    schema = Joi.object({
      gifts: Joi.array().items({
        id: Joi.string(),
        description: Joi.string().allow(''),
        gift_picture_url: Joi.string().allow(''),
      }),
    });
  } else if (req.body.type === 'shirt_detail') {
    schema = Joi.object({
      shirt_detail: Joi.array().items({
        id: Joi.string().required(),
        style: Joi.string().required(),
        shirt_picturl_url: Joi.string().required(),
      }),
    });
  } else if (req.body.type === 'size') {
    schema = Joi.object({
      size: Joi.array().items({
        id: Joi.string().required(),
        size: Joi.string().required(),
        description: Joi.string().allow(''),
      }),
    });
  } else if (req.body.type === 'rules') {
    schema = Joi.object({
      rules: Joi.array().items({
        id: Joi.string().required(),
        title: Joi.string().required(),
        detail: Joi.array().items({
          id: Joi.string().allow(''),
          description: Joi.string().allow(''),
        }),
      }),
    });
  } else if (req.body.type === 'rules1') {
    schema = Joi.object({
      rules1: Joi.string().required(),
    });
  } else if (req.body.type === 'more_detail') {
    schema = Joi.object({
      more_detail: Joi.string().required(),
    });
  } else if (req.body.type === 'condition') {
    schema = Joi.object({
      condition: Joi.string().required(),
    });
  } else if (req.body.type === 'senderAddress') {
    schema = Joi.object({
      senderAddress: {
        name: Joi.string().required(),
        address: Joi.string().required(),
        province: Joi.string().required(),
        zip: Joi.string().required(),
        phone_number: Joi.string().required(),
      },
    });
  } else if (req.body.type === 'contact') {
    schema = Joi.object({
      contact: {
        phone_number: Joi.string().required(),
        line: Joi.string().required(),
      },
    });
  }

  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const data = Joi.attempt(request, schema);
  const { id } = Joi.attempt(req.params, paramSchema);

  res
    .status(200)
    .send({ status: 200, data: await ActivityService.editActivity(id, data) });
}, permission.ADMIN);

const getActivityById = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, paramSchema);

  res
    .status(200)
    .send({ status: 200, data: await ActivityService.findById(id) });
}, permission.ADMIN);

router.get('/getactivities', listActivities);
router.get('/getactivity/:id', getActivityById);
router.post('/createactivity', createActivity);
router.post('/editactivity/:id', editActivity);

const createAdvertize = standardize(async (req, res) => {
  const schema = Joi.object({
    uri: Joi.string().required(),
    advertize_picture_url: Joi.string().required(),
  });

  const data = Joi.attempt(req.body, schema);

  res.status(200).send({
    status: 200,
    data: await MainAdvertizeService.createAdvertize(data),
  });
}, permission.ADMIN);

const deleteAdvertizeById = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, paramSchema);

  res
    .status(200)
    .send({ status: 200, data: await ActivityService.deleteAdvertizeById(id) });
}, permission.ADMIN);

router.post('/mainadvertize', createAdvertize);
router.delete('/mainadvertize/:id', deleteAdvertizeById);

const createOnboarding = standardize(async (req, res) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    subtitle: Joi.string().required(),
    description: Joi.string().required(),
    color: Joi.string().required(),
    picture: Joi.string().required(),
  });

  const data = Joi.attempt(req.body, schema);

  res.status(200).send({
    status: 200,
    data: await OnboardingService.createOnboarding(data),
  });
}, permission.ADMIN);

router.post('/onboarding', createOnboarding);

const getReportData = standardize(async (req, res) => {
  const allUsers = await UserService.findAllUser({});
  const maleUsers = await UserService.findAllUser({ gender: 'male' });
  const femaleUsers = await UserService.findAllUser({ gender: 'female' });
  const Users20 = await UserService.findAllUser({ max_age: 20 });
  const Users20_30 = await UserService.findAllUser({
    min_age: 21,
    max_age: 30,
  });
  const Users30_40 = await UserService.findAllUser({
    min_age: 31,
    max_age: 40,
  });
  const Users40_50 = await UserService.findAllUser({
    min_age: 41,
    max_age: 50,
  });
  const Users50 = await UserService.findAllUser({ min_age: 51 });

  const allActivities = await ActivityService.findAllActivity({});
  const pre_registerActivities = await ActivityService.findAllActivity({
    state: 'pre_register',
  });
  const registeringActivities = await ActivityService.findAllActivity({
    state: 'registering',
  });
  const end_registerActivities = await ActivityService.findAllActivity({
    state: 'end_register',
  });
  const actual_dateActivities = await ActivityService.findAllActivity({
    state: 'actual_date',
  });
  const finishedActivities = await ActivityService.findAllActivity({
    state: 'finished',
  });
  const cancelActivities = await ActivityService.findAllActivity({
    state: 'cancel',
  });
  const northActivities = await ActivityService.findAllActivity({
    region: 'ภาคเหนือ',
  });
  const centralActivities = await ActivityService.findAllActivity({
    region: 'ภาคกลาง',
  });
  const southActivities = await ActivityService.findAllActivity({
    region: 'ภาคใต้',
  });
  const easternActivities = await ActivityService.findAllActivity({
    region: 'ภาคตะวันออก',
  });
  const northeastActivities = await ActivityService.findAllActivity({
    region: 'ภาคตะวันออกเฉียงเหนือ',
  });

  const westernActivities = await ActivityService.findAllActivity({
    region: 'ภาคตะวันตก',
  });

  res.status(200).send({
    status: 200,
    data: {
      allUsers,
      maleUsers,
      femaleUsers,
      Users20,
      Users20_30,
      Users30_40,
      Users40_50,
      Users50,
      allActivities,
      pre_registerActivities,
      registeringActivities,
      end_registerActivities,
      actual_dateActivities,
      finishedActivities,
      cancelActivities,
      northActivities,
      centralActivities,
      southActivities,
      easternActivities,
      northeastActivities,
      westernActivities,
    },
  });
}, permission.ADMIN);

router.get('/getreportdata', getReportData);

const userActivities = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, paramSchema);

  res.json({
    status: 200,
    data: await ActivityService.getUserActivities(id),
  });
});

const filteredUserActivities = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, paramSchema);

  const schema = Joi.object({
    course: Joi.string(),
    size: Joi.string(),
    idcard: Joi.string(),
  });

  const filter = Joi.attempt(req.query, schema);

  res.json({
    status: 200,
    data: await UserActivityService.filteredUserActivities(id, filter),
  });
});

const updateContestNoUserActivities = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, paramSchema);

  const schema = Joi.object({
    contest_no: Joi.string().required(),
  });

  const data = Joi.attempt(req.body, schema);

  res.json({
    status: 200,
    data: await UserActivityService.updateContestNoUserActivities(id, data),
  });
});

const updatePrintedState = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, paramSchema);

  res.json({
    status: 200,
    data: await UserActivityService.updatePrintedState(id),
  });
});

const checkinActivity = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, paramSchema);

  res
    .status(200)
    .send({ status: 200, data: await UserActivityService.updateCheckedin(id) });
});

const checkoutActivity = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, paramSchema);

  const updatedUserActivity = await UserActivityService.updateCheckedOut(id);

  await UserYearRecordService.updateUserYearRecord(
    req.user.id,
    updatedUserActivity.activity.course.range
  );

  res.status(200).send({
    status: 200,
    data: updatedUserActivity,
  });
});

const editUserActivity = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, paramSchema);

  const updatedUserActivity = await UserActivityService.editUserActivity(
    id,
    req.body
  );

  res.status(200).send({
    status: 200,
    data: updatedUserActivity,
  });
});

router.get('/useractivities/:id', userActivities);
router.get('/filtereduseractivities/:id', filteredUserActivities);
router.post('/updatconstestuseractivities/:id', updateContestNoUserActivities);
router.get('/updateprintstate/:id', updatePrintedState);
router.post('/edituseractivity/:id', editUserActivity);
router.get('/checkinactivity/:id', checkinActivity);
router.post('/checkoutactivity/:id', checkoutActivity);

module.exports = router;
