const { UserService } = require('../services');
const faker = require('faker');

const generateUser = async (id) => {
  function _calculateAge(birthday) {
    // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  const birthday = new Date('2005-11-10');

  try {
    await UserService.create({
      username: id,
      password: 'password',
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      display_name: 'Minimal',
      birthday: birthday,
      age: _calculateAge(birthday),
      gender: 'female',
      blood_type: 'O',
      id_card_no: '1103700943955',
      phone_number: '0881493995',
      user_picture_url:
        'https://thestandard.co/wp-content/uploads/2020/10/COVER-WEB-197.jpg',
      state: 'active',
    });
    // process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// generateUser();

const createManyUsers = async () => {
  for (let index = 42; index <= 100; index++) {
    await generateUser(`user${index}`);
  }
  process.exit(0);
};

createManyUsers();
