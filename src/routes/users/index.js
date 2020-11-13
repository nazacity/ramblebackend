'use strict';

const Joi = require('joi');
const express = require('express');
const router = express.Router();

const { 
  constant: permission,
  enum: permissionEnum
} = require('../../utils/constants/permission');
const { standardize } = require('../../utils/request');
const { UserService } = require('../../services');

const listUsers = standardize(async (req, res) => {
  const schema = Joi.object({
    username: Joi.string(),

    firstname: Joi.string(),
    lastname: Joi.string(),

    base: Joi.string(),
    permission: Joi.string().valid(...permissionEnum),
    
    skip: Joi.string().default(0),
    limit: Joi.string().default(25)
  });

  const filter = Joi.attempt(req.query, schema);
  const { skip, limit } = filter;

  delete filter.skip;
  delete filter.limit;

  res.json(await UserService.list(filter, skip, limit));
}, permission.ADMIN);

const createUser = standardize(async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    base: Joi.string().required(),
    permission: Joi.string().valid(...permissionEnum).required(),
    avatar: Joi.string(),
    rank: Joi.string()
  });

  const user = Joi.attempt(req.body, schema);
  await UserService.create(user);
  res.status(201).send();
}, permission.ADMIN);

const editUser = standardize(async (req, res) => {
  const schema = Joi.object({
    permission: Joi.string()
  });
  const paramSchema = Joi.object({
    id: Joi.string().required()
  });

  const user = Joi.attempt(req.body, schema);
  const { id } = Joi.attempt(req.params, paramSchema);
  res.json(await UserService.edit(id, user));
}, permission.ADMIN);

router.get('/', listUsers);
router.post('/', createUser);
router.post('/:id', editUser);

module.exports = router;
