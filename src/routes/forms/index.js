'use strict';

const Joi = require('joi');
const express = require('express');
const router = express.Router();

const permission = require('../../utils/constants/permission').constant;
const { standardize } = require('../../utils/request');
const { FormService } = require('../../services');

const draftDurationEnum = require('../../utils/constants/draft_duration').enum;
const educationEnum = require('../../utils/constants/education').enum;
const { provinceEnum, regionEnum } = require('../../utils/constants/provinces');

const createForm = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    data: Joi.object({
      prompt: Joi.string().required(),
      type: Joi.string().required()
    })
  });

  const { name, data } = Joi.schema(req.body, schema);
  await FormService.create(name, data);
  return res.status(201).send();
};

const submitForm = async (req, res) => {
  const schema = Joi.object({

  })
};

const getRecruitsWithFormValues = standardize(async (req, res) => {
  const schema = Joi.object({
    formIds: Joi.string().required(),
    indices: Joi.string().required(),
    values: Joi.string().required(),

    firstName: Joi.string(),
    lastName: Joi.string(),
    citizenId: Joi.string(),
    dateOfBirth: Joi.date().less('now'),

    province: Joi.string().valid(...provinceEnum),
    region: Joi.string().valid(...regionEnum),

    height: Joi.number(),
    weight: Joi.number(),

    specialAbilities: Joi.array().items(Joi.string()),
    education: Joi.string().valid(...educationEnum),
    placeOfGraduation: Joi.string(),
    major: Joi.string(),
    job: Joi.string(),

    bmi: Joi.string(),

    baseId: Joi.string().allow(null),
    trainingBaseId: Joi.string().allow(null),
    militaryId: Joi.string().allow(null),
    draftDuration: Joi.string().allow(null).valid(...draftDurationEnum),
    religion: Joi.string().allow(null)
  });

  const filter = Joi.attempt(req.query, schema);

  const { formIds, indices, values } = filter;

  delete filter.formIds;
  delete filter.indices;
  delete filter.values;

  const allowedBases = await MilitaryBaseService.getAllowedBases(req.user.baseId);
  if (filter.baseId) {
    if (allowedBases.indexOf(filter.baseId) === -1) {
      return res.status(401).send();
    } else {
      filter.baseId = {
        $in: await MilitaryBaseService.getAllowedBases(filter.baseId)
      }      
    }
  } else {
    filter.baseId = {
      $in: allowedBases
    }
  };

  return res.json(await FormService.getRecruitsWithFormValues(formIds, indices, values, filter));
}, permission.VIEWER);

router.post('/', createForm);
router.post('/:id/submit', submitForm)
router.get('/:id/recruits', getRecruitsWithFormValues);

module.exports = router;
