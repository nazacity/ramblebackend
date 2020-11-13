'use strict';

const Joi = require('joi');
const express = require('express');
const router = express.Router();

const permission = require('../../utils/constants/permission').constant;
const { standardize } = require('../../utils/request');
const { FormService, MilitaryBaseService } = require('../../services');

const draftDurationEnum = require('../../utils/constants/draft_duration').enum;
const educationEnum = require('../../utils/constants/education').enum;
const { provinceEnum, regionEnum } = require('../../utils/constants/provinces');

const createForm = standardize(async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    data: Joi.array().items(Joi.object({
      prompt: Joi.string().required(),
      type: Joi.string().required()
    }))
  });

  const { name, data } = Joi.attempt(req.body, schema);
  await FormService.create(name, data);
  return res.status(201).send();
}, permission.EDITOR);

const getForm = standardize(async (req, res) => {
  const schema = Joi.object({
    id: Joi.string().required(),
  });

  const { id } = Joi.attempt(req.params, schema);
  res.json(await FormService.get(id));
}, permission.VIEWER);

const submitForm = standardize(async (req, res) => {
  const bodySchema = Joi.object({
    draftDate: Joi.date().required(),
    data: Joi.array().items(Joi.object({
      _id: Joi.string().required(),
      prompt: Joi.string().required(),
      type: Joi.string().required(),
      answer: Joi.any().required()
    }))
  });

  const paramSchema = Joi.object({
    formId: Joi.string().required(),
    recruitId: Joi.string().required()
  });

  const { draftDate, data } = Joi.attempt(req.body, bodySchema);
  const { formId, recruitId } = Joi.attempt(req.params, paramSchema);
  await FormService.submit(formId, recruitId, draftDate, data);
  return res.status(201).send();
}, permission.EDITOR);

const getRecruitsWithFormValues = standardize(async (req, res) => {
  const schema = Joi.object({
    formIds: Joi.string().required(),
    questionIds: Joi.string().required(),
    answers: Joi.string().required(),

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

  filter.formIds = filter.formIds.split(',');
  filter.questionIds = filter.questionIds.split(',');
  filter.answers = filter.answers.split(',');
  const { formIds, questionIds, answers } = filter;

  delete filter.formIds;
  delete filter.questionIds;
  delete filter.answers;

  const allowedBases = await MilitaryBaseService.getAllowedBases(req.user.base);
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

  return res.json(await FormService.getRecruitsWithFormValues(formIds, questionIds, answers, filter));
}, permission.VIEWER);

router.post('/', createForm);
router.get('/:id', getForm);
router.post('/:formId/recruits/:recruitId', submitForm);
router.get('/:id/recruits', getRecruitsWithFormValues);

module.exports = router;
