'use strict';

const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

const config = require('../../utils/config');

const loginHandler = (req, res) => {
  const token = jwt.sign(
    {
      sub: req.user._id,
      type: 'partner',
    },
    config.jwt.secret,
    {
      issuer: config.jwt.issuer,
      expiresIn: '6h',
    }
  );
  res.json({ token, partner: req.user });
};

router.post('/', loginHandler);

module.exports = router;
