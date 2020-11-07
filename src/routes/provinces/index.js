'use strict';

const express = require('express');
const router = express.Router();

const { ProvinceService } = require('../../services');

const getAllProvinces = async (req, res) => {
  try {
    res.json(await ProvinceService.getAll());
  } catch (error) {
    res.status(500).send(error.message);
  }
}

router.get('/', getAllProvinces);

module.exports = router;
