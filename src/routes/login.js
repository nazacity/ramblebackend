'use strict';

const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

const config = require('../utils/config');

const loginHandler = (req, res) => {
  const token = jwt.sign({
    sub: req.user._id,
  }, config.jwt.secret, 
  {
    issuer: config.jwt.issuer
  });
  res.json({ token });
}

router.post('/', loginHandler);

module.exports = router;
