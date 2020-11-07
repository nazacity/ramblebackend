'use strict';

const Joi = require('joi');
const express = require('express');
const router = express.Router();

const { MilitaryBaseService } = require('../../services');

const createMilitaryBase = async (req, res) => {
  // TODO add permission must be admin
  try {
    const schema = Joi.object({
      id: Joi.string().required(),
      parent: Joi.string().allow(null),
      children: Joi.array().items(Joi.string().allow(null)),
      isLowest: Joi.boolean().required()
    });

    const { id, parent, children, isLowest } = Joi.attempt(req.body, schema);
    await MilitaryBaseService.create(id, parent, children, isLowest);
    res.status(201).send();
  } catch (error) {
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
