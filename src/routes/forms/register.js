'use strict';

const _ = require('lodash');
const Joi = require('joi');

const permission = require('../../utils/constants/permission').constant;
const { standardize } = require('../../utils/request');

const { RecruitService, FormService } = require('../../services');

const draftDurationEnum = require('../../utils/constants/draft_duration').enum;
const educationEnum = require('../../utils/constants/education').enum;
const { provinceEnum, provinceDict } = require('../../utils/constants/provinces');

const forms = [
  {
    _id: '5fafd348d8a10348405380ed',
    fields: ['phone', 'line', 'facebook', 'instagram', 'twitter', 'fatherName', 
      'fatherAge', 'fatherJob', 'fatherPhone', 'fatherStatus', 'motherName', 
      'motherAge', 'motherJob', 'motherPhone', 'motherStatus', 'familyStatus', 
      'wifeName', 'wifeAge', 'wifeJob', 'wifePhone', 'child', 'emergencyContactName', 
      'emergencyContactPhone', 'emergencyContactRelationship']
  },
  {
    _id: '5fafd34fd8a10348405380ee',
    fields: ['congenitalDisease', 'sick', 'sickDetail', 'sickDrugUse', 'haveDrunk',
      'injured', 'injuredDetail', 'drugUse', 'drugUseDetail', 'exercise', 
      'otherIssue', 'otherIssueDetail']
  },
  {
    _id: '5fafd35ed8a10348405380ef',
    fields: ['familyProblem', 'familyProblemDetail', 'naturalDisaster', 
      'naturalDisasterDetail', 'otherProblem']
  },
  {
    _id: '5fafd36ad8a10348405380f0',
    fields: ['politicalPerspective', 'motto', 'wishedJob', 'wishedJobReason',
      'idol']
  }
]

const registerForm = standardize(async (req, res) => {
  const schema = Joi.object({
    // Page 1
    base: Joi.string().required(),
    trainingBase: Joi.string().required(),
    draftDuration: Joi.string().required().valid(...draftDurationEnum),
    draftDate: Joi.date().required(),

    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    citizenId: Joi.string().required(),
    dateOfBirth: Joi.date().less('now'),
    religion: Joi.string().required(),

    address: Joi.string().required(),
    district: Joi.string().required(),
    province: Joi.string().required().valid(...provinceEnum),

    weight: Joi.number().required(),
    height: Joi.number().required(),
    bloodType: Joi.string().required(),

    education: Joi.string().required().valid(...educationEnum),
    placeOfGraduation: Joi.string().allow(''),
    major: Joi.string().allow(''),
    
    job: Joi.string().allow(''),
    jobIncome: Joi.string().allow(''),
    partTime: Joi.string().allow(''),
    partTimeIncome: Joi.string().allow(''),
    
    specialAbilities: Joi.string().allow(''),

    // Page 2
    phone: Joi.string().required(),
    line: Joi.string().allow(''),
    facebook: Joi.string().allow(''),
    instagram: Joi.string().allow(''),
    twitter: Joi.string().allow(''),

    fatherName: Joi.string().allow(''),
    fatherAge: Joi.string().allow(''),
    fatherJob: Joi.string().allow(''),
    fatherPhone: Joi.string().allow(''),
    fatherStatus: Joi.boolean(),
    
    motherName: Joi.string().allow(''),
    motherAge: Joi.string().allow(''),
    motherJob: Joi.string().allow(''),
    motherPhone: Joi.string().allow(''),
    motherStatus: Joi.boolean(),

    familyStatus: Joi.string().required(),

    wifeName: Joi.string().allow(''),
    wifeAge: Joi.string().allow(''),
    wifeJob: Joi.string().allow(''),
    wifePhone: Joi.string().allow(''),

    child: Joi.array().items(Joi.object({
      name: Joi.string().allow(''), 
      age: Joi.string().allow(''), 
      gender: Joi.string().allow('')
    })),

    emergencyContactName: Joi.string().required(),
    emergencyContactPhone: Joi.string().required(),
    emergencyContactRelationship: Joi.string().required(),

    // Page 3
    congenitalDisease: Joi.boolean().required(),
    sick: Joi.boolean().required(),
    sickDetail: Joi.string().allow(''),
    sickDrugUse: Joi.boolean().required(),
    haveDrunk: Joi.boolean().required(),
    injured: Joi.boolean().required(),
    injuredDetail: Joi.string().allow(''),
    drugUse: Joi.boolean().required(),
    drugUseDetail: Joi.string().allow(''),
    exercise: Joi.boolean().required(),
    otherIssue: Joi.boolean().required(),
    otherIssueDetail: Joi.string().allow(''),

    // Page 4
    familyProblem: Joi.boolean().required(),
    familyProblemDetail: Joi.string().allow(''),
    naturalDisaster: Joi.boolean().required(),
    naturalDisasterDetail: Joi.string().allow(''),
    otherProblem: Joi.string().allow(''),

    // Page 5
    politicalPerspective: Joi.string().allow(''),
    motto: Joi.string().allow(''),
    wishedJob: Joi.string().allow(''),
    wishedJobReason: Joi.string().allow(''),
    idol: Joi.string().allow(''),
  });

  const data = Joi.attempt(req.body, schema);
  
  const recruit = await RecruitService.create({
    firstName: data.firstName,
    lastName: data.lastName,
    citizenId: data.citizenId,
    dateOfBirth: data.dateOfBirth, // missing

    address: data.address,
    district: data.district,
    province: data.province, // needs to with region also
    region: provinceDict[data.province],

    height: data.height,
    weight: data.weight,
    bloodType: data.bloodType,

    specialAbilities: data.specialAbilities,
    education: data.education,
    placeOfGraduation: data.placeOfGraduation,
    major: data.major,
    job: data.job,
    jobIncome: data.jobIncome,
    partTime: data.partTime,
    partTimeIncome: data.partTimeIncome,

    base: data.base,
    trainingBase: data.trainingBase,
    draftDuration: data.draftDuration,
    draftDate: data.draftDate,

    drugUse: data.drugUse,
    religion: data.religion
  });

  for (let i = 0; i < forms.length; i++) {
    await FormService.submit(
      forms[i]._id, 
      recruit._id, 
      recruit.draftDate, 
      _.pick(data, forms[i].fields)
    );
  }

  res.status(201).send();
}, permission.VIEWER);

module.exports = {
  registerForm
};
