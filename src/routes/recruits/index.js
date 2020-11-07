'use strict';

const Joi = require('joi');
const express = require('express');
const router = express.Router();

const postRecruitHandler = async (req, res) => {
  try {
    const schema = Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      citizen_id: Joi.string().required(),
      date_of_birth: Joi.date().required(),

      provinceId: Joi.string().required(),
      regionId: Joi.string().required(),

      height: Joi.number().required(),
      weight: Joi.number().required(),

      specialAbilities: Joi.array().items(Joi.string()),
      education: Joi.string().required(),
      placeOfGraduation: Joi.string().required(),
      major: Joi.string(),
      job: Joi.string(),

      baseId: Joi.string().required(),
      trainingBaseId: Joi.string().required(),
      militaryId: Joi.string().required(),
      draftDuration: Joi.string().required(),
      religion: Joi.string()
    });

    const recruitData = schema.attempt(req.body);
  } catch (error) {

  }
}

const getRecruitHandler = async (req, res) => {
  try {

  } catch (error) {
    
  }
}

router.get('/', getRecruitHandler);
router.post('/', postRecruitHandler);

module.exports = router;
