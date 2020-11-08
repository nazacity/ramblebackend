'use strict';

const Joi = require('joi');
const express = require('express');
const router = express.Router();

const { FormService } = require('../../services');

const createForm = (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    data: Joi.object({
      prompt: Joi.string().required(),
      type: Joi.string().required()
    })
  });

  const { name, data } = Joi.schema(req.body, schema);
  await FormService.create(name, data);
};

const submitForm = (req, res) => {
};

router.post('/', createForm);
router.post('/:id/submit', submitForm)

module.exports = router;
