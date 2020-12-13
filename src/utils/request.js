'use strict';

const { EmployeeService } = require('../services');

const withPermission = (fn, permissionLevel) => (req, res) => {
  if (!EmployeeService.checkPermission(req.user, permissionLevel)) {
    console.log(req.user, permissionLevel);
    return res.status(401).send();
  }
  return fn(req, res);
};

const standardize = (fn, permissionLevel) => async (req, res) => {
  try {
    await withPermission(fn, permissionLevel)(req, res);
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

module.exports = {
  withPermission,
  standardize,
};
