'use strict';

const { query } = require('express');
const AbstractService = require('./abstract');

class FormService extends AbstractService {
  getFormsForRecruit (recruitId) {
    return this.models.FormRecruit.find({ recruitId });
  }

  getRecruitsWithFormValues (formIds, indices, values, filter) {
    let recruitIds;
    for (let i = 0; i < formIds.length; i++) {
      const formId = formIds[i];
      const index = indices[i];
      const value = values[i];
      const key = `data.${index}`;
      query = {
        formId,
        [key]: value
      };
      if (recruitIds) {
        query.recruitId = { $in: recruitIds };
      }
      const formRecruits = await this.models.FormRecruit.find();
      recruitIds = formRecruits.map(formRecruit => formRecruit.recruitId);
    }

    if (filter) {
      filter._id = { $in: recruitIds }
      return this.models.Recruit.find(filter).skip(skip).limit(limit);
    }
  }
  
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
