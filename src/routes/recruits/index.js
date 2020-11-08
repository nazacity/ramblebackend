'use strict';

const Joi = require('joi');
const express = require('express');
const router = express.Router();

const permission = require('../../utils/constants/permission').constant;
const { standardize } = require('../../utils/request');
const { RecruitService, MilitaryBaseService } = require('../../services');

const draftDurationEnum = require('../../utils/constants/draft_duration').enum;
const educationEnum = require('../../utils/constants/education').enum;
const { provinceEnum, regionEnum } = require('../../utils/constants/provinces');

const postRecruit = standardize(async (req, res) => {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    citizenId: Joi.string().required(),
    dateOfBirth: Joi.date().less('now').required(),

    province: Joi.string().required().valid(...provinceEnum),
    region: Joi.string().required().valid(...regionEnum),

    height: Joi.number().required(),
    weight: Joi.number().required(),

    specialAbilities: Joi.array().items(Joi.string()),
    education: Joi.string().required().valid(...educationEnum),
    placeOfGraduation: Joi.string().allow(null),
    major: Joi.string().allow(null),
    job: Joi.string().allow(null),

    baseId: Joi.string().required(),
    trainingBaseId: Joi.string().required(),
    militaryId: Joi.string().allow(null),
    draftDuration: Joi.string().required().valid(...draftDurationEnum),
    draftDate: Joi.date().required(),
    religion: Joi.string().allow(null)
  });

  const recruit = Joi.attempt(req.body, schema);
  await RecruitService.create(recruit);
  return res.status(201).send();
}, permission.EDITOR);

const getRecruit = standardize(async (req, res) => {
  const schema = Joi.object({
    id: Joi.string().required()
  });

  const { id } = Joi.attempt(req.params, schema);
  const recruit = await RecruitService.get(id);

  // check permission
  const allowedBases = await MilitaryBaseService.getAllowedBases(req.user.baseId);
  if (allowedBases.indexOf(recruit.baseId) === -1) {
    return res.status(401).send();
  }

  return res.json(recruit);  
}, permission.VIEWER);

const listRecruits = standardize(async (req, res) => {
  const schema = Joi.object({
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
    religion: Joi.string().allow(null),

    skip: Joi.number().default(0),
    limit: Joi.number().default(25)
  });

  const filter = Joi.attempt(req.query, schema);

  if (filter.bmi) {
    if (/>[0-9]+/.test(filter.bmi)) {
      filter.bmi = {
        $gt: +filter.bmi.slice(1)
      };
    } else if (/<[0-9]+/.test(filter.bmi)) {
      filter.bmi = {
        $lt: +filter.bmi.slice(1)
      };
    } else if (/[0-9]+/.test(filter.bmi)) {
      filter.bmi = +filter.bmi.slice(1)
    } else {
      delete filter.bmi;
    }
  }

  // only show the baseId within the scope allowed
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
  
  const { skip, limit } = filter;

  delete filter.skip;
  delete filter.limit;

  return res.json(await RecruitService.list(filter, skip, limit));
}, permission.VIEWER);

router.get('/', listRecruits);
router.get('/:id', getRecruit);
router.post('/', postRecruit);

module.exports = router;
