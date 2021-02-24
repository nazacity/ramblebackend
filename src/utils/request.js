'use strict';

const { EmployeeService } = require('../services');
const config = require('./config');
const axios = require('axios');

const withPermission = (fn, permissionLevel) => (req, res) => {
  if (!EmployeeService.checkPermission(req.user, permissionLevel)) {
    console.log(req.user, permissionLevel);
    return res.status(401).send();
  }
  return fn(req, res);
};

const standardize = (fn, permissionLevel) => async (req, res) => {
  try {
    if (permissionLevel) {
      await withPermission(fn, permissionLevel)(req, res);
    } else {
      await fn(req, res);
    }
  } catch (error) {
    if (error.isJoi) {
      console.error(error.message);
      res.status(400).send(error.message);
    } else {
      console.error(error.message);
      res.status(500).send(error.message);
    }
  }
};

const getSocial = async (path, headers) => {
  const res = await axios.get(`${config.social.URL}${path}`, { headers });
  return res.data;
};

const postSocial = async (path, body, headers) => {
  const res = await axios.post(`${config.social.URL}${path}`, body, {
    headers,
  });
  return res.data;
};

module.exports = {
  withPermission,
  standardize,
  getSocial,
  postSocial,
};
