'use strict';

const faker = require('faker');

const { MilitaryBaseService, RecruitService, UserService } = require('../services');

const provinces = require('../utils/constants/provinces').constant;
const educationEnum = require('../utils/constants/education').enum;
const draftDurationEnum = require('../utils/constants/draft_duration').enum;
const religionEnum = require('../utils/constants/religion').enum;

const { MilitaryBase, Recruit, User } = require('../models');
const { waitForDBConnection } = require('../utils/mongo');

const getRandomArrItem = arr => {
  return arr[Math.floor(Math.random() * arr.length)];
}

const generateNumberInRange = (min, max) => {
  const diff = max - min;
  return Math.floor(Math.random() * diff + min);
}

const D = 3;
const N = 50;

const baseIds = [];

const generateFakeBattalion = async (index, parentId) => {
  const { _id } =  await MilitaryBaseService.create(`กองพัน ${index}`, parentId, null);
  baseIds.push(_id);
};

const generateFakeDivisions = async (index, parent) => {
  const { name } = await MilitaryBaseService.create(`กองพล ${index}`, parent, null);
  for (let i = 0; i < D; i++) {
    await generateFakeBattalion(index * D + i, name);
  } 
};

const generateFakeArmy = async (index) => {
  const { name } = await MilitaryBaseService.create(`ทัพภาค ${index}`, null, null);
  for (let i = 0; i < D; i++) {
    await generateFakeDivisions(index * D + i, name);
  }
};

const generateFakeBases = async () => {
  for (let i = 0; i < D; i++) {
    await generateFakeArmy(i);
  }
};

const generateCitizenId = () => {
  return Math.floor(Math.random() * 9000000000000);
};

const generateBoolean = () => {
  return Math.random() > 0.5;
};

const generateFakeRecruits = async () => {
  for (let i = 0; i < baseIds.length; i++ ) {
    const baseId = baseIds[i];

    const startIndex = (i * 4) % (provinces.length - 4);
    const currentProvinces = provinces.slice(startIndex, startIndex + 4);
    for (let j = 0; j < N; j++) {
      const { province, region } = getRandomArrItem(currentProvinces);

      const recruit = {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(), 
        citizenId: generateCitizenId(),
        dateOfBirth: faker.date.past(10, new Date("Sat Sep 20 2000 21:35:02 GMT+0200 (CEST)")),
  
        province,
        region,

        avatarURL: faker.internet.avatar(),
  
        height: generateNumberInRange(165, 185),
        weight: generateNumberInRange(50, 100),
  
        specialAbilities: [],
        education: getRandomArrItem(educationEnum),
        drugUse: generateBoolean(),
        // placeOfGraduation: Joi.string().allow(null),
        // major: Joi.string().allow(null),
        // job: Joi.string().allow(null),
  
        base: baseId,
        trainingBase: baseId,
        // militaryId: Joi.string().allow(null),
        draftDuration: getRandomArrItem(draftDurationEnum),
        draftDate: '2020-11-01',
        religion: getRandomArrItem(religionEnum)
      };
      await RecruitService.create(recruit);
    }
  }
};

const generateAdmin = async () => {
  const { _id } = await MilitaryBase.findOne({ name: 'ทัพภาค 0' });
  await UserService.create({
    username: 'rambo',
    password: 'password',
    firstName: 'John',
    lastName: 'Rambo',
    base: _id,
    permission: 'admin',
    rank: 'ร้อยโท'
  });
}

async function main () {
  try {
    await waitForDBConnection;
    await MilitaryBase.remove({});
    await Recruit.remove({});
    await User.remove({});
    await generateFakeBases();
    await generateFakeRecruits();
    await generateAdmin();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
