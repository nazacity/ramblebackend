'use strict';

const Joi = require('joi');
const express = require('express');
const router = express.Router();

const permission = require('../../utils/constants/permission').constant;
const { MilitaryBaseService } = require('../../services');

const createMilitaryBase = async (req, res) => {
  if (req.user.permission !== permission.ADMIN) {
    return res.status(401).send();
  }

  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      parent: Joi.string().allow(null),
      children: Joi.array().items(Joi.string().allow(null)),
    });

    const { name, parent, children } = Joi.attempt(req.body, schema);
    await MilitaryBaseService.create(name, parent, children);
    res.status(201).send();
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
}

const getAllLowestMilitaryBases = async (req, res) => {
  try {
    res.json(await MilitaryBaseService.getAllLowest());
  } catch (error) {
    res.status(500).send(error.message);
  }
}

const getAllChildrenMilitaryBases = async (req, res) => {
  try {
    const schema = Joi.object({
      id: Joi.string().required()
    });
    const { id } = Joi.attempt(req.params, schema);
    res.json(await MilitaryBaseService.getAllChildren(id));
  } catch (error) {
    res.status(500).send(error.message);
  }
}

router.post('/', createMilitaryBase);
router.get('/:id/allchildren', getAllChildrenMilitaryBases);
router.get('/lowest', getAllLowestMilitaryBases);

module.exports = router;
