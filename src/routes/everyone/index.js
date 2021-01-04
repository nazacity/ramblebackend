const Joi = require('joi');
const express = require('express');
const router = express.Router();
const config = require('../../utils/config');
const axios = require('axios');
const model = require('../../models');
const {
  UserService,
  UserActivityService,
  ActivityService,
  UserPostService,
  EmergencyContactService,
  AddressService,
  MainAdvertizeService,
  OnboardingService,
} = require('../../services');
const { user_gender, blood_type } = require('../../utils/constants/user');

const confirmPayment = async (req, res) => {
  const userActivity = await model.UserActivity.findByIdAndUpdate(
    req.body.billPaymentRef1.toLowerCase() +
      req.body.billPaymentRef2.toLowerCase(),
    {
      $set: {
        state: 'upcoming',
        transaction: {
          id: req.body.transactionId,
          sendingBank: req.body.sendingBankCode,
          payDate: req.body.transactionDateandTime,
        },
      },
    }
  )
    .populate({ path: 'user', select: { device_token: 1 } })
    .populate({ path: 'activity.id', select: { title: 1, location: 1 } });

  const activity = userActivity.activity.id;
  const user_device_token = userActivity.user.device_token;

  try {
    const sendNotification = await axios({
      method: 'post',
      url: 'https://onesignal.com/api/v1/notifications',
      data: {
        app_id: config.onesignal.app_id,
        include_player_ids: [user_device_token],
        headings: { en: 'Payment Confirmed', th: 'ยืนยันการชำระเรียบร้อย' },
        contents: {
          en: `Thank you for joining ${activity.title}`,
          th: `ขอบคุณที่ร่วมรายการ ${activity.title}`,
        },
      },
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Basic ${config.onesignal.rest_api_key}`,
      },
    });
  } catch (error) {
    console.log(error.response);
  }

  res.status(200).send('thank you SCB');
};

router.post('/confirmpayment', confirmPayment);

// Activity
const listActivities = async (req, res) => {
  const schema = Joi.object({
    title: Joi.string(),

    region: Joi.string(),
    province: Joi.string(),

    from: Joi.date(),
    to: Joi.date().greater(Joi.ref('from')),

    range_min: Joi.number(),
    range_max: Joi.number().greater(Joi.ref('range_min')),

    skip: Joi.string().default(0),
    limit: Joi.string().default(5),
  });

  const filter = Joi.attempt(req.query, schema);
  const { skip, limit } = filter;

  delete filter.skip;
  delete filter.limit;

  res.json(await ActivityService.listActivity(filter, skip, limit));
};

router.get('/getactivities', listActivities);

function _calculateAge(birthday) {
  // birthday is a date
  var ageDifMs = Date.now() - birthday.getTime();
  var ageDate = new Date(ageDifMs); // miliseconds from epoch
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

const createUser = async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    display_name: Joi.string().required(),

    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    phone_number: Joi.string().required(),
    birthday: Joi.date().required(),
    gender: Joi.string()
      .valid(...user_gender)
      .required(),
    blood_type: Joi.string()
      .valid(...blood_type)
      .required(),
    user_picture_url: Joi.string().required(),
  });

  const user = Joi.attempt(req.body, schema);

  user.age = _calculateAge(user.birthday);

  res.status(201).send({ status: 200, data: await UserService.create(user) });
};

router.post('/createuser', createUser);

const getMainAdvertize = async (req, res) => {
  res.status(201).send({
    status: 200,
    data: await MainAdvertizeService.getMainAdvertizes(),
  });
};

const getOnboarding = async (req, res) => {
  res.status(201).send({
    status: 200,
    data: await OnboardingService.getOnboarding(),
  });
};

router.get('/mainadvertize', getMainAdvertize);
router.get('/onboarding', getOnboarding);

module.exports = router;
