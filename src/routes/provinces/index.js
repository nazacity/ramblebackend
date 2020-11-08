'use strict';

const express = require('express');
const router = express.Router();

const provinces = require('../../utils/constants/provinces').constant;

const getAllProvinces = (req, res) => {
  res.json(provinces);
};

router.get('/', getAllProvinces);

module.exports = router;
