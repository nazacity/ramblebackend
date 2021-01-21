'use strict';

const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

const config = require('../../utils/config');
const user = require('../../utils/constants/user');

const loginHandler = (req, res) => {
  const token = jwt.sign(
    {
      sub: req.user._id,
      type: 'user',
    },
    config.jwt.secret,
    {
      issuer: config.jwt.issuer,
    }
  );

  if (req.authInfo.message === 'No user is found') {
    return res.json({ message: 'No user is found' });
  }
  res.json({ token, user: req.user });
};

router.post('/', loginHandler);

module.exports = router;
