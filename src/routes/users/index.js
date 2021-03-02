'use strict';

const Joi = require('joi');
const express = require('express');
const router = express.Router();
const config = require('../../utils/config');
const axios = require('axios');
const {
  deleteFile,
  uploadIdCard,
  uploadIdCardWithPerson,
  uploadCovid,
} = require('../../utils/spacesutil');
const moment = require('moment');

const { standardize } = require('../../utils/request');
const {
  UserService,
  UserActivityService,
  ActivityService,
  UserPostService,
  EmergencyContactService,
  AddressService,
  UserYearRecordService,
} = require('../../services');
const { user_gender, blood_type } = require('../../utils/constants/user');

function _calculateAge(birthday) {
  // birthday is a date
  var ageDifMs = Date.now() - birthday.getTime();
  var ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

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
  let schema;
  const request = { ...req.body };
  delete request.type;

  if (req.body.type === 'editUserPictureProfile') {
    schema = Joi.object({
      user_picture_url: Joi.string().required(),
    });
  } else if (req.body.type === 'editUserBackgroundPictureProfile') {
    schema = Joi.object({
      user_background_picture_url: Joi.string().required(),
    });
  } else if (req.body.type === 'first_name') {
    schema = Joi.object({
      first_name: Joi.string().required(),
    });
  } else if (req.body.type === 'last_name') {
    schema = Joi.object({
      last_name: Joi.string().required(),
    });
  } else if (req.body.type === 'display_name') {
    schema = Joi.object({
      display_name: Joi.string().required(),
    });
  } else if (req.body.type === 'phone_number') {
    schema = Joi.object({
      phone_number: Joi.string().required(),
    });
  } else if (req.body.type === 'new_register') {
    schema = Joi.object({
      phone_number: Joi.string().required(),
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      birthday: Joi.date().required(),
      gender: Joi.string()
        .valid(...user_gender)
        .required(),
      blood_type: Joi.string()
        .valid(...blood_type)
        .required(),
    });

    const user = Joi.attempt(request, schema);
    user.age = _calculateAge(user.birthday);
    return res.json({
      status: 200,
      data: await UserService.edit(req.user.id, user),
    });
  }

  const user = Joi.attempt(request, schema);

  res.json({ status: 200, data: await UserService.edit(req.user.id, user) });
});

const updateDeviceToken = async (req, res) => {
  const schema = Joi.object({
    user: Joi.string().required(),
    device_token: Joi.string().required(),
    // platform: Joi.string().required(),
  });

  const { device_token, user } = Joi.attempt(
    { user: req.user.id, ...req.body },
    schema
  );

  if (req.user.device_token !== device_token) {
    await UserService.updateDeviceToken(user, device_token);
    res.status(200).json({ stats: 200, data: 'Updated Device Token' });
  } else {
    res
      .status(200)
      .json({ stats: 200, data: 'Device Token has not been changed' });
  }
};

const changePassword = standardize(async (req, res) => {
  const schema = Joi.object({
    old_password: Joi.string().required(),
    new_password: Joi.string().required(),
  });

  const data = Joi.attempt(req.body, schema);

  res.json({
    status: 200,
    data: await UserService.changePassword(
      req.user.id,
      data,
      req.user.birthday
    ),
  });
});

router.get('/getusers', listUsers);
router.post('/createuser', createUser);
router.post('/updatedevicetoken', updateDeviceToken);
router.post('/edituser', editUser);
router.post('/changepassworduser', changePassword);

// User Activity
const createUserActivity = standardize(async (req, res) => {
  const schema = Joi.object({
    user: Joi.string().required(), // user id
    activity: {
      id: Joi.string().required(), // activity id
      course: {
        _id: Joi.string().required(),
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
    idcard: Joi.string().allow(null).allow(''),
    announcement: Joi.array().items({
      _id: Joi.string().allow(null).allow(''),
      active: Joi.boolean().allow(null).allow(''),
      title: Joi.string().allow(null).allow(''),
      description: Joi.string().allow(null).allow(''),
      picture_url: Joi.string().allow(null).allow(''),
      createdAt: Joi.date().allow(null).allow(''),
    }),
  });

  const userActivity = Joi.attempt(
    {
      user: req.user.id,
      ...req.body,
      idcard: req.user.idcard ? req.user.idcard : '',
    },
    schema
  );

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
    user,
    userActivity.size,
    userActivity.activity.course,
    userActivity.address
  );
  res.status(201).send({ id: newUserActivity.id });
});

const getUserByJwt = standardize(async (req, res) => {
  return res.json(req.user);
});

const requestPayment = standardize(async (req, res) => {
  const schema = Joi.object({
    amount: Joi.number().required(),
    activity_title: Joi.string().required(),
    mailfee: Joi.boolean().required(),
  });
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { amount } = Joi.attempt(req.body, schema);

  const { id } = Joi.attempt(req.params, paramSchema);

  try {
    const scbRes = await axios({
      method: 'post',
      // url: `https://api-sandbox.partners.scb/partners/sandbox/v1/oauth/token`,
      url: `
      https://api-uat.partners.scb/partners/v1/oauth/token`,
      headers: {
        'Content-Type': 'application/json',
        resourceOwnerId: config.scb.key,
        requestUId: 'testestes',
      },
      data: {
        applicationKey: config.scb.key,
        applicationSecret: config.scb.secret,
      },
    });

    const accessToken = scbRes.data.data.accessToken;

    const qrcodeRes = await axios({
      method: 'post',
      // url: `https://api-sandbox.partners.scb/partners/sandbox/v1/payment/qrcode/create`,
      url: `https://api-uat.partners.scb/partners/v1/payment/qrcode/create`,
      headers: {
        'Content-Type': 'application/json',
        resourceOwnerId: config.scb.key,
        requestUId: 'testestes',
        authorization: `Bearer ${accessToken}`,
      },
      data: {
        qrType: 'PP',
        ppType: 'BILLERID',
        ppId: config.scb.billerId,
        amount: `${amount.toFixed(2)}`,
        ref1: id.substring(0, 10).toUpperCase(),
        ref2: id.substring(10).toUpperCase(),
        ref3: 'NAZ',
      },
    });

    return res.status(200).send(qrcodeRes.data);
  } catch (error) {
    console.log('error: ', error);
  }
});

const requestBillpaymentByTransactions = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
    trans_id: Joi.string().required(),
  });

  const { id, trans_id } = Joi.attempt(req.params, paramSchema);

  const userActivity = await UserActivityService.findById(id);

  const transRef = userActivity.transaction.find(
    (item) => item._id.toString() === trans_id.toString()
  );

  try {
    const scbRes = await axios({
      method: 'post',
      // url: `https://api-sandbox.partners.scb/partners/sandbox/v1/oauth/token`,
      url: `
      https://api-uat.partners.scb/partners/v1/oauth/token`,
      headers: {
        'Content-Type': 'application/json',
        resourceOwnerId: config.scb.key,
        requestUId: 'testestes',
      },
      data: {
        applicationKey: config.scb.key,
        applicationSecret: config.scb.secret,
      },
    });

    const accessToken = scbRes.data.data.accessToken;

    const transactionRes = await axios({
      method: 'get',
      // url: `https://api-sandbox.partners.scb/partners/sandbox/v1/payment/billpayment/transactions/${transRef.id}?sendingBank=014`,
      url: `https://api-uat.partners.scb/partners/sandbox/v1/payment/billpayment/transactions/${transRef.id}?sendingBank=014`,
      headers: {
        'Content-Type': 'application/json',
        resourceOwnerId: config.scb.key,
        requestUId: 'testestes',
        authorization: `Bearer ${accessToken}`,
      },
    });

    return res.status(200).send(transactionRes.data);
  } catch (error) {
    console.log('error: ', error);
    return res.status(200).send('error');
  }
});

const requestBillpaymentByInquiry = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
    trans_id: Joi.string().required(),
  });

  const { id, trans_id } = Joi.attempt(req.params, paramSchema);

  const userActivity = await UserActivityService.findById(id);

  const transRef = userActivity.transaction.find(
    (item) => item._id.toString() === trans_id.toString()
  );

  try {
    const scbRes = await axios({
      method: 'post',
      // url: `https://api-sandbox.partners.scb/partners/sandbox/v1/oauth/token`,
      url: `
      https://api-uat.partners.scb/partners/v1/oauth/token`,
      headers: {
        'Content-Type': 'application/json',
        resourceOwnerId: config.scb.key,
        requestUId: 'testestes',
      },
      data: {
        applicationKey: config.scb.key,
        applicationSecret: config.scb.secret,
      },
    });

    const accessToken = scbRes.data.data.accessToken;

    console.log('accessToken', accessToken);

    const inquryRes = await axios({
      method: 'get',
      // url: `https://api-sandbox.partners.scb/partners/sandbox/v1/payment/billpayment/inquiry?billerId=${
      //   config.scb.billerId
      // }&reference1=${id
      //   .substring(0, 10)
      //   .toUpperCase()}&reference2=${id
      //   .substring(10)
      //   .toUpperCase()}&transactionDate=${moment(transRef).format(
      //   'YYYY-MM-DD'
      // )}&eventCode=00300100`,
      url: `https://api-uat.partners.scb/partners/v1/payment/billpayment/inquiry?billerId=${
        config.scb.billerId
      }&reference1=${id
        .substring(0, 10)
        .toUpperCase()}&reference2=${id
        .substring(10)
        .toUpperCase()}&transactionDate=${moment(transRef).format(
        'YYYY-MM-DD'
      )}&eventCode=00300100`,
      headers: {
        'Content-Type': 'application/json',
        resourceOwnerId: config.scb.key,
        requestUId: 'testestes',
        authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(inquryRes.data);

    return res.status(200).send(inquryRes.data);
  } catch (error) {
    console.log('error: ', error);
    return res.status(200).send('error');
  }
});

router.get('/getuserbyjwt', getUserByJwt);
router.post('/createuseractivity', createUserActivity);
router.post('/requestpayment/:id', requestPayment);
router.get(
  '/requestbillpaymentbytransactions/:id/:trans_id',
  requestBillpaymentByTransactions
);
router.get(
  '/requestbillpaymentbyinquiry/:id/:trans_id',
  requestBillpaymentByInquiry
);

// User Post
const createUserPost = standardize(async (req, res) => {
  const schema = Joi.object({
    form_team: Joi.boolean().required(),
    share_accommodation: Joi.boolean().required(),
    share_transportation: Joi.boolean().required(),
    share_trip: Joi.boolean().required(),
    male: Joi.boolean().required(),
    female: Joi.boolean().required(),
    activity: Joi.string().required(),
    user: Joi.string().required(),
    description: Joi.string().required(),
    province: Joi.string().allow(''),
    user_activity_id: Joi.string().required(),
  });

  const userPost = Joi.attempt({ user: req.user.id, ...req.body }, schema);

  const newUserPost = await UserPostService.createUserPost(userPost);
  await UserService.updateUserPost(req.user.id, newUserPost.id);
  await UserActivityService.updateUserPost(
    userPost.user_activity_id,
    newUserPost.id
  );

  res.status(201).send();
});

const editUserPost = standardize(async (req, res) => {
  const schema = Joi.object({
    form_team: Joi.boolean().required(),
    share_accommodation: Joi.boolean().required(),
    share_transportation: Joi.boolean().required(),
    share_trip: Joi.boolean().required(),
    male: Joi.boolean().required(),
    female: Joi.boolean().required(),
    user: Joi.string().required(),
    description: Joi.string().required(),
    province: Joi.string().allow(''),
  });
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, paramSchema);

  const userPost = Joi.attempt({ user: req.user.id, ...req.body }, schema);

  const newUserPost = await UserPostService.editUserPost(id, userPost);

  res.status(201).send();
});

const changeUserPostState = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });
  const schema = Joi.object({
    state: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, paramSchema);
  const data = Joi.attempt(req.body, schema);

  const newUserPost = await UserPostService.changeUserPostState(id, data);

  res.status(201).send();
});

const listFilteredUserPosts = standardize(async (req, res) => {
  const schema = Joi.object({
    form_team: Joi.boolean().required(),
    share_accommodation: Joi.boolean().required(),
    share_transportation: Joi.boolean().required(),
    share_trip: Joi.boolean().required(),
    male: Joi.boolean().required(),
    female: Joi.boolean().required(),
    activity: Joi.string().required(),
    skip: Joi.string().default(0),
    limit: Joi.string().default(100),
  });

  const filter = Joi.attempt(req.body, schema);
  const { skip, limit } = filter;

  // console.log(filter);

  delete filter.skip;
  delete filter.limit;

  const user_post_ids = req.user.user_posts.map((item) => {
    return item._id;
  });

  res.json({
    status: 200,
    data: await UserPostService.listFilteredUserPosts(
      filter,
      skip,
      limit,
      user_post_ids
    ),
  });
});

const listUserPostsByActivity = standardize(async (req, res) => {
  const schema = Joi.object({
    activity: Joi.string().required(),
    skip: Joi.string().default(0),
    limit: Joi.string().default(10),
  });

  const filter = Joi.attempt(req.query, schema);
  const { skip, limit } = filter;

  delete filter.skip;
  delete filter.limit;

  const user_post_ids = req.user.user_posts.map((item) => {
    return item._id;
  });

  const data = await UserPostService.listUserPostsByActivity(
    filter,
    skip,
    limit,
    user_post_ids
  );

  res.json({
    status: 200,
    data: data,
  });
});

router.get('/userpostsbyactivity', listUserPostsByActivity);
router.post('/filtereduserposts', listFilteredUserPosts);
router.post('/createuserpost', createUserPost);
router.post('/edituserpost/:id', editUserPost);
router.post('/changeuserpoststate/:id', changeUserPostState);

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
const userListActivities = standardize(async (req, res) => {
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

  const user = await UserService.findById(req.user.id).populate({
    path: 'user_activities',
  });

  const activityIds = user.user_activities.map((item) => item.activity.id);

  res.json({
    status: 200,
    data: await ActivityService.userListActivities(
      activityIds,
      filter,
      skip,
      limit
    ),
  });
});

router.get('/getactivities', userListActivities);

const listPromoteActivities = standardize(async (req, res) => {
  const schema = Joi.object({
    skip: Joi.string().default(0),
    limit: Joi.string().default(5),
  });

  const filter = Joi.attempt(req.query, schema);
  const { skip, limit } = filter;

  delete filter.skip;
  delete filter.limit;

  const user = await UserService.findById(req.user.id).populate({
    path: 'user_activities',
  });

  const activityIds = user.user_activities.map((item) => item.activity.id);

  res.json({
    status: 200,
    data: await ActivityService.listPromoteActivity(activityIds, skip, limit),
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

const useCoupon = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, paramSchema);

  const schema = Joi.object({
    couponId: Joi.string().required(),
  });

  const { couponId } = Joi.attempt({ ...req.body }, schema);

  res.status(200).send({
    status: 200,
    data: await UserActivityService.useCoupon(id, couponId),
  });
});

const updateReadState = standardize(async (req, res) => {
  const paramSchema = Joi.object({
    user_activity_id: Joi.string().required(),
    item_id: Joi.string().required(),
  });

  const { user_activity_id, item_id } = Joi.attempt(req.params, paramSchema);

  res.status(200).send({
    status: 200,
    data: await UserActivityService.updateReadState(user_activity_id, item_id),
  });
});

router.get('/getactivity/:id', getActivityById);
router.get('/checkinactivity/:id', checkinActivity);
router.post('/checkoutactivity/:id', checkoutActivity);
router.post('/usecoupon/:id', useCoupon);
router.get('/getpromoteactivities', listPromoteActivities);
router.get('/updatereadstate/:user_activity_id/:item_id', updateReadState);

const lineConnect = async (req, res) => {
  const schema = Joi.object({
    lineId: Joi.string().required(),
  });

  const data = Joi.attempt(req.body, schema);

  // console.log(req.user._id);

  res.status(201).send({
    status: 200,
    data: await UserService.lineConnect(req.user._id, data.lineId),
  });
};

router.post('/lineconnect', lineConnect);

const deleteImage = standardize(async (req, res) => {
  const { fileName } = req.body;

  deleteFile(fileName, res);
});

router.post('/deleteimage', deleteImage);

const sendIdentityInfo = standardize(async (req, res) => {
  uploadIdCard(req, res, async function (error) {
    if (error) {
      console.log(error);
      return res.status(400).json({ data: 'Something went wrong' });
    } else {
      const user = await UserService.edit(req.user._id, {
        idcard: req.body.number,
        vefiry_information: {
          id_card_piture_url: req.files.idcard[0].location,
          id_card_with_person_piture_url:
            req.files.idcardwithperson[0].location,
          state: 'verifying',
        },
      });

      return res.status(200).json({ status: 200, data: user });
    }
  });
});

router.post('/sendidentityinfo', sendIdentityInfo);

const sendCovidResult = standardize(async (req, res) => {
  uploadCovid(req, res, async function (error) {
    if (error) {
      console.log(error);
      return res.status(400).json({ data: 'Something went wrong' });
    } else {
      const user = await UserService.edit(req.user._id, {
        vefiry_vaccine: {
          vaccine_confirm_piture_url: req.files.covid[0].location,
          state: 'verifying',
        },
      });

      return res.status(200).json({ status: 200, data: user });
    }
  });
});

router.post('/sendcovidresult', sendCovidResult);

module.exports = router;
