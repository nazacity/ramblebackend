'use strict';

const Joi = require('joi');
const express = require('express');
const router = express.Router();

const permission = require('../../utils/constants/permission').constant;
const { standardize } = require('../../utils/request');
const { MilitaryBaseService } = require('../../services');

const createMilitaryBase = standardize(async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    parent: Joi.string().allow(null),
    children: Joi.array().items(Joi.string().allow(null)),
  });

  const { name, parent, children } = Joi.attempt(req.body, schema);
  await MilitaryBaseService.create(name, parent, children);
  return res.status(201).send();
}, permission.ADMIN);

const getAllLowestMilitaryBases = standardize(async (req, res) => {
  return res.json(await MilitaryBaseService.getAllLowest());
}, permission.VIEWER);

const getAllChildrenMilitaryBases = standardize(async (req, res) => {
  const schema = Joi.object({
    id: Joi.string().required()
  });
  const { id } = Joi.attempt(req.params, schema);
  return res.json(await MilitaryBaseService.getAllChildren(id));
}, permission.VIEWER);

router.post('/', createMilitaryBase);
router.get('/:id/allchildren', getAllChildrenMilitaryBases);
router.get('/lowest', getAllLowestMilitaryBases);

module.exports = router;
