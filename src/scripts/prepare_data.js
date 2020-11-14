'use strict';

const { MilitaryBaseService, UserService, FormService } = require('../services');

const { MilitaryBase, Recruit, User, Form } = require('../models');
const { waitForDBConnection } = require('../utils/mongo');


const battilionNames = [
  'ส.พัน.12',
  'พลาธิการ',
  'ส.ห.'
];

const generateBattalions = async (index, parentId) => {
  await MilitaryBaseService.create(battilionNames[index], parentId, null);
};

const generateDivisions = async () => {
  const { name } = await MilitaryBaseService.create(`กองพลทหารม้าที่ 2 รักษาพระองค์`, null);
  for (let i = 0; i < 3; i++) {
    await generateBattalions(i, name);
  } 
};

const generateAdmin = async () => {
  const { _id } = await MilitaryBase.findOne({ name: 'กองพลทหารม้าที่ 2 รักษาพระองค์' });
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

const formNames = [
  { name: 'การติดต่อ', _id: '5fafd348d8a10348405380ed' },
  { name: 'แบบคัดกรองปัจจัยเสี่ยง', _id: '5fafd34fd8a10348405380ee' },
  { name: 'แบบสอบถามปัญหาครอบครัว', _id: '5fafd35ed8a10348405380ef' },
  { name: 'แบบสอบถามมุมมองต่อสังคม', _id: '5fafd36ad8a10348405380f0' }
];

const generateForm = async () => {
  for (let i = 0; i < 4; i++) {
    await FormService.create(formNames[i].name, null, formNames[i]._id);
  }
}

async function main () {
  try {
    await waitForDBConnection;
    await MilitaryBase.remove({});
    await Recruit.remove({});
    await User.remove({});
    await Form.remove({});
    await generateDivisions();
    await generateAdmin();
    await generateForm();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
