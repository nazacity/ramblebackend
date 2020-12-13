const { EmployeeService } = require('../services');

const generateAdmin = async () => {
  await EmployeeService.create({
    username: 'ramble',
    password: 'password',

    // personal information
    first_name: 'John',
    last_name: 'Doe',
    phone_number: '0888888888',
    picture_url:
      'https://0.soompi.io/wp-content/uploads/2020/11/07032415/nam-joo-hyuk-start-up.jpeg',

    permission: 'admin',
  });
};

generateAdmin();
