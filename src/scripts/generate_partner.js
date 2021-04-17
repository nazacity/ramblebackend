const { PartnerService } = require('../services');

const generatePartner = async (id) => {
  try {
    await PartnerService.createPartner({
      username: 'spartumz12345',
      password: 'tumz0839936150',
      display_name: 'พี่ตั้ม',
      activities: [],
      first_name: 'พี่ตั้ม',
      last_name: 'test',
      phone_number: '0954967272',
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

generatePartner();

const createManyPartners = async () => {
  for (let index = 1; index < 100; index++) {
    await generatePartner(`partner${index}`);
  }
  process.exit(0);
};

// createManyPartners();
