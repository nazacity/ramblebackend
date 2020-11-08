'use strict';

const AbstractService = require('./abstract');

class FormService extends AbstractService {
  create (name, data) {
    return this.models.Form.create({
      name,
      data
    });
  }

  submit (formId, recruitId, data) {
    return this.models.FormRecruit.create({
      formId,
      recruitId,
      data
    });
  }
}

module.exports = FormService;
