'use strict';

const Joi = require('joi');
const express = require('express');
const router = express.Router();

const { standardize } = require('../../utils/request');
const { PartnerService, ActivityService } = require('../../services');

const editPartner = standardize(async (req, res) => {
  const schema = Joi.object({
    permission: Joi.string(),
  });
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const user = Joi.attempt(req.body, schema);
  const { id } = Joi.attempt(req.params, paramSchema);
  res.json(await PartnerService.edit(id, user));
});

const editActivity = standardize(async (req, res) => {
  const schema = Joi.object({
    permission: Joi.string(),
  });
  const paramSchema = Joi.object({
    id: Joi.string().required(),
  });

  const data = Joi.attempt(req.body, schema);
  const { id } = Joi.attempt(req.params, paramSchema);
  res.json(await ActivityService.editActivity(id, data));
});

router.post('/editpartner/:id', editPartner);
router.post('/editactivity/:id', editActivity);

module.exports = router;
