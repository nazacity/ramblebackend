'use strict';

const Joi = require('joi');
const express = require('express');
const router = express.Router();

const { UserService } = require('../../services');

const getUsers = async (req, res) => {
  try {
    
  } catch (error) {
    res.status(500).send(error.message);
  }
}

const createUser = async (req, res) => {
  try {
    const schema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      baseId: Joi.string().required(),
      permission: Joi.string().required(),
      avatar: Joi.string(),
      rank: Joi.string()
    });

    const user = Joi.attempt(req.body, schema);
    await UserService.create(user);
    res.status(201).send();
  } catch (error) {
    res.status(500).send(error.message);
  }
}

router.get('/', getUsers);
router.post('/', createUser);

module.exports = router;
