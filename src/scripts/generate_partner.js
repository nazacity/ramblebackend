const { PartnerService } = require('../services');

const generatePartner = async (id) => {
  try {
    await PartnerService.createPartner({
      username: id,
      password: 'password',
      display_name: id,
      activities: [],
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// generatePartner();

const createManyPartners = async () => {
  for (let index = 1; index < 100; index++) {
    await generatePartner(`partner${index}`);
  }
  process.exit(0);
};

createManyPartners();
