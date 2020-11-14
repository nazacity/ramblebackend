'use strict';

const provinces = require('./provinces-by-region')

const provinceDict = {};
provinces.forEach(({ province, region }) => {
  provinceDict[province] = region;
});

module.exports = {
  provinceEnum: provinces.map(({ province }) => province),
  regionEnum: [
    'ภาคกลาง',
    'ภาคใต้',
    'ภาคเหนือ',
    'ภาคตะวันออก',
    'ภาคตะวันออกเฉียงเหนือ',
    'ภาคตะวันตก'
  ],
  constant: provinces,
  provinceDict 
};
