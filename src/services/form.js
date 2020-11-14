'use strict';

const AbstractService = require('./abstract');

class FormService extends AbstractService {
  get (id) {
    return this.models.Form.findById(id);
  }

  getFormsForRecruit (recruitId) {
    return this.models.FormRecruit.find({ recruitId });
  }

  async getRecruitsWithFormValues (formIds, questionIds, answers, filter) {
    let recruitIds;
    for (let i = 0; i < formIds.length; i++) {
      const formId = formIds[i];
      const questionId = questionIds[i];
      const answer = answers[i];
      const query = {
        formId,
        data: { $elemMatch: { _id: questionId, answer } }
      };
      if (recruitIds) {
        query.recruitId = { $in: recruitIds };
      }
      const formRecruits = await this.models.FormRecruit.find(query);
      recruitIds = formRecruits.map(formRecruit => formRecruit.recruitId);
    }

    if (filter) {
      filter._id = { $in: recruitIds }
      return this.models.Recruit.find(filter);
    }
  }
  
  create (name, data, _id) {
    return this.models.Form.create({
      _id,
      name,
      data
    });
  }

  submit (form, recruit, draftDate, data) {
    return this.models.FormRecruit.create({
      form,
      recruit,
      draftDate,
      data
    });
  }
}

module.exports = FormService;
