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

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_HEADER = {
  'Content-Type': 'application/json',
  Authorization: `Bearer +uniMVPzDtJP6aWzmxYkYOUpzXjtaiezdLDeOEpbOfGRSSFgmOMY7VOYy/AoxKzfxjvhrP4kSVzEaYwms/lTC+IIp6BlBSHcwlkGwLRlH70irpG8o6+RVQM4pxm/oKjCVesV4vLhdKRfhjRDfQvSLQdB04t89/1O/w1cDnyilFU=`,
};

// Activity
const lineBot = async (req, res) => {};

router.post('/line', lineBot);

module.exports = router;
