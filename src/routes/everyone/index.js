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
  PartnerService,
} = require('../../services');
const { user_gender, blood_type } = require('../../utils/constants/user');

const confirmPayment = async (req, res) => {
  // console.log(req.body);
  const oldUserActivity = await model.UserActivity.findById(
    req.body.billPaymentRef1.toLowerCase() +
      req.body.billPaymentRef2.toLowerCase()
  );
  const updatedUserActivity = await model.UserActivity.findByIdAndUpdate(
    req.body.billPaymentRef1.toLowerCase() +
      req.body.billPaymentRef2.toLowerCase(),
    {
      $set: {
        // state: 'upcoming',
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
    .populate({ path: 'user', select: { device_token: 1, lineId } })
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

  if (updatedUserActivity.address.toString() !== '5ff6600d20ed83388ab4ccbd') {
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
    res.status(400).send(error);
  }

  console.log(updatedUserActivity.user);

  if (updatedUserActivity.user.lineId) {
    try {
      const data = JSON.stringify({
        to: updatedUserActivity.user.lineId,
        messages: [
          {
            type: 'flex',
            altText: `ส่งสินค้าเรียบร้อย`,
            contents: {
              type: 'bubble',
              size: 'giga',
              header: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'box',
                    layout: 'horizontal',
                    contents: [
                      {
                        type: 'image',
                        url: activity.activity_picture_url,
                        size: 'full',
                        aspectMode: 'cover',
                        aspectRatio: '300:200',
                        gravity: 'center',
                        flex: 1,
                      },
                      {
                        type: 'box',
                        layout: 'horizontal',
                        contents: [
                          {
                            type: 'text',
                            text: 'Registered',
                            size: 'xs',
                            color: '#ffffff',
                            align: 'center',
                            gravity: 'center',
                          },
                        ],
                        backgroundColor: '#EC3D44',
                        paddingAll: '2px',
                        paddingStart: '4px',
                        paddingEnd: '4px',
                        flex: 0,
                        position: 'absolute',
                        offsetStart: '18px',
                        offsetTop: '18px',
                        cornerRadius: '100px',
                        width: '100px',
                        height: '25px',
                      },
                    ],
                  },
                ],
                paddingAll: '0px',
              },
              body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'box',
                    layout: 'vertical',
                    contents: [
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                          {
                            type: 'text',
                            contents: [],
                            size: 'xl',
                            wrap: true,
                            text: 'ยืนยันการชำระเรียบร้อย',
                            color: '#ffffff',
                            weight: 'bold',
                            align: 'center',
                          },
                          {
                            type: 'text',
                            text: `ขอบคุณที่ร่วมรายการ ${activity.title}`,
                            color: '#ffffffcc',
                            size: 'sm',
                            align: 'center',
                          },
                        ],
                        spacing: 'sm',
                      },
                      {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                          {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                              {
                                type: 'text',
                                contents: [],
                                size: 'sm',
                                wrap: true,
                                margin: 'lg',
                                color: '#ffffffde',
                                text: 'พบกับฟีเจอร์อื่นๆ เพิ่มเติมได้ใน',
                                align: 'center',
                              },
                              {
                                type: 'text',
                                text: 'Ramble Mobile Application',
                                color: '#ffffffde',
                                margin: 'lg',
                                size: 'sm',
                                align: 'center',
                              },
                            ],
                          },
                          {
                            type: 'box',
                            layout: 'vertical',
                            contents: [
                              {
                                type: 'image',
                                url:
                                  'https://firebasestorage.googleapis.com/v0/b/ramble-73f09.appspot.com/o/applystore.png?alt=media&token=f35d484e-fd0c-4fb5-8116-a5188db82711',
                                aspectRatio: '292:70',
                                size: '4xl',
                                backgroundColor: '#00000099',
                                aspectMode: 'fit',
                                margin: 'md',
                                action: {
                                  type: 'uri',
                                  label: 'action',
                                  uri:
                                    'https://apps.apple.com/th/app/ramble/id1551268864?l=th',
                                },
                              },
                              {
                                type: 'image',
                                url:
                                  'https://firebasestorage.googleapis.com/v0/b/ramble-73f09.appspot.com/o/googleplay.png?alt=media&token=1549b9f6-8deb-4259-9408-850fecfb6d82',
                                margin: 'lg',
                                size: '4xl',
                                aspectRatio: '292:70',
                                backgroundColor: '#00000099',
                                aspectMode: 'fit',
                                action: {
                                  type: 'uri',
                                  label: 'action',
                                  uri:
                                    'https://play.google.com/store/apps/details?id=com.ramble',
                                },
                              },
                            ],
                          },
                        ],
                        paddingAll: '13px',
                        backgroundColor: '#ffffff1A',
                        cornerRadius: '2px',
                        margin: 'xl',
                      },
                    ],
                  },
                ],
                paddingAll: '20px',
                backgroundColor: '#8a1776',
              },
            },
          },
        ],
      });

      await axios.post(`${config.line.message_api}/push`, data, {
        headers: config.line.header,
      });
    } catch (error) {
      console.log(error.response);
      res.status(400).send(error);
    }
  }

  res.status(200).send({
    resCode: '00',
    resDesc: 'success',
    transactionId: req.body.transactionId,
  });
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
    phone_number: Joi.string(),
    birthday: Joi.date().required(),
    gender: Joi.string()
      .valid(...user_gender)
      .required(),
    blood_type: Joi.string()
      .valid(...blood_type)
      .required(),
    user_picture_url: Joi.string().required(),
    lineId: Joi.string().allow(''),
    appleId: Joi.string().allow(''),
  });

  const user = Joi.attempt(req.body, schema);

  user.age = _calculateAge(user.birthday);

  const createdUser = await UserService.create(user);

  res.status(201).send({ status: 200, data: 'Successed' });

  const socialUserCreate = await axios.post(
    `${config.social.URL}/api/everyone/createuser`,
    {
      _id: createdUser._id,
      display_name: user.display_name,
      user_picture_url: user.user_picture_url,
    }
  );
};

router.post('/createuser', createUser);

const createUserWithApple = async (req, res) => {
  const schema = Joi.object({
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    appleId: Joi.string().required(),
  });

  const user = Joi.attempt(req.body, schema);

  const createdUser = await UserService.createUserWithApple(user);

  res.status(201).send({ status: 200, data: 'Successed' });

  const socialUserCreate = await axios.post(
    `${config.social.URL}/api/everyone/createuser`,
    {
      _id: createdUser._id,
      display_name: createdUser.display_name,
    }
  );

  console.log(socialUserCreate);
};

router.post('/createuserwithapple', createUserWithApple);

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
      data: 'idcardno is used',
    });
  } else {
    let total = 0;
    let iPID;
    let chk;
    let Validchk;
    iPID = req.params.id.replace(/-/g, '');
    Validchk = req.params.id.substr(12, 1);
    let j = 0;
    let pidcut;
    for (let n = 0; n < 12; n++) {
      pidcut = parseInt(iPID.substr(j, 1));
      total = total + pidcut * (13 - n);
      j++;
    }

    chk = 11 - (total % 11);

    if (chk == 10) {
      chk = 0;
    } else if (chk == 11) {
      chk = 1;
    }
    if (chk == Validchk) {
      return res.status(200).json({ status: 200, data: 'idcardno is correct' });
    } else {
      return res.status(200).json({
        status: 200,
        data: 'idcardno is incorrect',
      });
    }
    // const body = {
    //   Sex: req.params.id,
    //   Button: 'ตรวจสอบข้อมูล',
    // };

    // const data = await axios({
    //   method: 'post',
    //   url:
    //     'https://data.bopp-obec.info/emis/register.php?p=chk_digit&School_ID=1095440071&Area_CODE=9502',
    //   data: qs.stringify(body),
    //   headers: { 'content-type': 'application/x-www-form-urlencoded' },
    // });
    // const checkRight = data.data.indexOf(
    //   'หมายเลขบัตรประจำตัวประชาชนของคุณถูกต้อง'
    // );
    // if (checkRight > -1) {
    // res
    //   .status(200)
    //   .json({ status: 200, data: 'หมายเลขบัตรประจำตัวประชาชนของคุณถูกต้อง' });
    // } else {
    // res.status(200).json({
    //   status: 200,
    //   data: 'หมายเลขบัตรประจำตัวประชาชนของคุณไม่ถูกต้อง',
    // });
    // }
  }
};

router.get('/checkcitizenidnumber/:id', checkCitizenIdNumber);

const forgotPassword = async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required(),
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

// const partnerRegisterForm = async (req, res) => {
//   const schema = Joi.object({
//     first_name: Joi.string().required(),
//     last_name: Joi.string().required(),
//     company_name: Joi.string().required(),
//     phone_number: Joi.string().required(),
//     line_id: Joi.string().required(),
//   });

//   const data = Joi.attempt(req.body, schema);

//   res.status(201).send({
//     status: 200,
//     data: await PartnerService.partnerRegisterForm(data),
//   });
// };
// router.post('/partnerregister', partnerRegisterForm);

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

const createUserAdressEmergencyActivity = async (req, res) => {
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
    idcard: Joi.string().required(),
    address: {
      _id: Joi.string().required(),
      address: Joi.string().allow(null).allow(''),
      province: Joi.string().allow(null).allow(''),
      zip: Joi.string().allow(null).allow(''),
      phone_number: Joi.string().allow(null).allow(''),
    },
    emergency: {
      name: Joi.string().required(),
      relationship: Joi.string().required(),
      phone_number: Joi.string().required(),
    },
    announcement: Joi.array().items({
      _id: Joi.string().allow(null).allow(''),
      active: Joi.boolean().allow(null).allow(''),
      title: Joi.string().allow(null).allow(''),
      description: Joi.string().allow(null).allow(''),
      picture_url: Joi.string().allow(null).allow(''),
      createdAt: Joi.date().allow(null).allow(''),
    }),
  });

  const data = Joi.attempt(req.body, schema);

  let newAddress;
  if (data.address._id === 'new') {
    newAddress = await AddressService.createAddress({
      address: data.address.address,
      province: data.address.province,
      zip: data.address.zip,
      phone_number: data.address.phone_number,
    });
  } else {
    newAddress = { _id: data.address._id };
  }
  await UserService.updateAddress(data.user, newAddress._id);
  let newEmergencyContact = await EmergencyContactService.createEmergencyContact(
    data.emergency
  );
  await UserService.updateEmergencyContact(data.user, newEmergencyContact._id);

  const userActivity = {
    ...data,
    address: newAddress._id,
    emergency_contact: newEmergencyContact._id,
  };

  const newUserActivity = await UserActivityService.createUserActivity(
    userActivity
  );
  const user = await UserService.updateUserActivity(
    data.user,
    newUserActivity.id
  );

  await ActivityService.updateUserActivity(
    req.body.activity.id,
    newUserActivity._id,
    user,
    userActivity.size,
    userActivity.activity.course,
    userActivity.address
  );

  res.status(200).json({ status: 200, data: newUserActivity });
};

// Activity
const userListActivities = async (req, res) => {
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
};

router.get('/getactivities', userListActivities);
router.post('/getuserfromlinetoken', getUserFromLineToken);
router.get('/getactivitybyid/:id', getActivityById);
router.post(
  '/createuseradressemergencyactivity',
  createUserAdressEmergencyActivity
);

const partnerRegister = async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    display_name: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    company_name: Joi.string(),
    phone_number: Joi.string(),
  });

  const partner = Joi.attempt(req.body, schema);

  res
    .status(201)
    .send({ status: 200, data: await PartnerService.createPartner(partner) });
};

router.post('/partnerregister', partnerRegister);

const lineConnect = async (req, res) => {
  const schema = Joi.object({
    accessToken: Joi.string().required(),
    user_id: Joi.string().required(),
  });

  const data = Joi.attempt(req.body, schema);

  let line;
  await axios
    .get('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    })
    .then((res) => {
      line = res.data;
    })
    .catch((err) => {
      console.log(err);
    });

  if (line.userId) {
    res.status(201).send({
      status: 200,
      data: await UserService.lineConnect(data.user_id, line.userId),
    });
  } else {
    res.status(401).send({
      status: 401,
      data: 'Line User is not found',
    });
  }
};

const test = async (req, res) => {
  res.status(200).json({ social: config.social.URL });
};

router.get('/test', test);

router.post('/lineconnect', lineConnect);

module.exports = router;
