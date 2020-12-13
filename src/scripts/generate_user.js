const { UserService } = require('../services');

const generateUser = async () => {
  try {
    await UserService.create({
      username: 'user',
      password: 'password',
      first_name: 'John',
      last_name: 'Doe',
      display_name: 'Minimal',
      birthday: new Date('1992-11-10'),
      gender: 'male',
      blood_type: 'O',
      id_card_no: '1103700943955',
      phone_number: '0881493995',
      user_picture_url:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjv0D0QABobqwiqLPA8_DyjI7O72SXTIjsUw&amp;usqp=CAU',
      state: 'active',
    });
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

generateUser();
