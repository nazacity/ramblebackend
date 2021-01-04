'use strict';

const AbstractService = require('./abstract');

class OnboardingService extends AbstractService {
  async createOnboarding(data) {
    return this.models.Onboarding.create(data);
  }

  async getOnboarding() {
    return this.models.Onboarding.find();
  }
}

module.exports = OnboardingService;
