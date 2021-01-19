const Joi = require('joi');
const express = require('express');
const router = express.Router();
const config = require('../../utils/config');
const axios = require('axios');
const model = require('../../models');
const qs = require('qs');
const {
  UserService,
  UserActivityService,
  ActivityService,
  UserPostService,
  EmergencyContactService,
  AddressService,
  MainAdvertizeService,
  OnboardingService,
  PartnerService,
} = require('../../services');
const { user_gender, blood_type } = require('../../utils/constants/user');

const confirmPayment = async (req, res) => {
  const oldUserActivity = await model.UserActivity.findById(
    req.body.billPaymentRef1.toLowerCase() +
      req.body.billPaymentRef2.toLowerCase()
  );
  const updatedUserActivity = await model.UserActivity.findByIdAndUpdate(
    req.body.billPaymentRef1.toLowerCase() +
      req.body.billPaymentRef2.toLowerCase(),
    {
      $set: {
        state: 'upcoming',
        transaction: [
          ...oldUserActivity.transaction,
          {
            id: req.body.transactionId,
            sendingBank: req.body.sendingBankCode,
            payDate: req.body.transactionDateandTime,
            amount: req.body.amount,
          },
        ],
      },
    }
  )
    .populate({ path: 'user', select: { device_token: 1 } })
    .populate({
      path: 'activity.id',
      select: { title: 1, location: 1, courses: 1, report_infomation: 1 },
    });

  const activity = updatedUserActivity.activity.id;
  const user_device_token = updatedUserActivity.user.device_token;

  const courses = activity.courses;
  const courseIndex = activity.courses.findIndex(
    (item) => item._id.toString() === updatedUserActivity.activity.course._id
  );
  courses[courseIndex].revenue = courses[courseIndex].revenue
    ? courses[courseIndex].revenue + updatedUserActivity.activity.course.price
    : updatedUserActivity.activity.course.price;

  let mailfee = activity.report_infomation.mailfee
    ? activity.report_infomation.mailfee
    : 0;

  console.log(req.body.billPaymentRef3);
  if (req.body.billPaymentRef3 === 'MAILFEE') {
    mailfee += 80;
  }

  await model.Activity.findByIdAndUpdate(activity._id, {
    $set: {
      report_infomation: {
        ...activity.report_infomation,
        mailfee: mailfee,
      },
      courses: courses,
    },
  });

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
    idcard: Joi.string().required(),
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

const checkCitizenIdNumber = async (req, res) => {
  const user = await model.User.findOne({ idcard: req.params.id });
  if (user) {
    res.status(200).json({
      status: 200,
      data: 'รหัสบัตรประชาชนถูกใช้งานแล้ว',
    });
  } else {
    const body = {
      Sex: req.params.id,
      Button: 'ตรวจสอบข้อมูล',
    };

    const data = await axios({
      method: 'post',
      url:
        'https://data.bopp-obec.info/emis/register.php?p=chk_digit&School_ID=1095440071&Area_CODE=9502',
      data: qs.stringify(body),
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
    const checkRight = data.data.indexOf(
      'หมายเลขบัตรประจำตัวประชาชนของคุณถูกต้อง'
    );
    if (checkRight > -1) {
      res
        .status(200)
        .json({ status: 200, data: 'หมายเลขบัตรประจำตัวประชาชนของคุณถูกต้อง' });
    } else {
      res.status(200).json({
        status: 200,
        data: 'หมายเลขบัตรประจำตัวประชาชนของคุณไม่ถูกต้อง',
      });
    }
  }
};

router.get('/checkcitizenidnumber/:id', checkCitizenIdNumber);

const forgotPassword = async (req, res) => {
  const schema = Joi.object({
    idcard: Joi.string().required(),
    phone_number: Joi.string().required(),
  });

  const user = Joi.attempt(req.body, schema);
  res
    .status(201)
    .send({ status: 200, data: await UserService.forgotPassword(user) });
};

const resetPassword = async (req, res) => {
  const schema = Joi.object({
    _id: Joi.string().required(),
    password: Joi.string().required(),
  });

  const user = Joi.attempt(req.body, schema);

  res.status(201).send({
    status: 200,
    data: await UserService.resetPassword(user._id, user.password),
  });
};

router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);

const partnerRegisterForm = async (req, res) => {
  const schema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    company_name: Joi.string().required(),
    phone_number: Joi.string().required(),
    line_id: Joi.string().required(),
  });

  const data = Joi.attempt(req.body, schema);

  res.status(201).send({
    status: 200,
    data: await PartnerService.partnerRegisterForm(data),
  });
};
router.post('/partnerregister', partnerRegisterForm);

// Line Processing
const getUserFromLineToken = async (req, res) => {
  const { accessToken } = req.body;
  let line;
  await axios
    .get('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    .then((res) => {
      line = res.data;
    })
    .catch((err) => {
      console.log(err);
    });

  const user = await UserService.findByLineId(line.userId, line.pictureUrl);

  res.status(200).send({
    status: 200,
    data: user,
  });
};

const getActivityById = async (req, res) => {
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });
  const { id } = Joi.attempt(req.params, paramSchema);
  const activity = await ActivityService.findById(id);

  res.status(200).send({
    status: 200,
    data: activity,
  });
};

router.post('/getuserfromlinetoken', getUserFromLineToken);
router.get('/getactivitybyid/:id', getActivityById);

module.exports = router;
