'use strict';

const provinces = require('./provinces-by-region')

module.exports = {
  provinceEnum: provinces.map(({ province }) => province),
  regionEnum: [
    'ภาคใต้',
    'ภาคเหนือ',
    'ภาคตะวันออก',
    'ภาคตะวันออกเฉียงเหนือ',
    'ภาคตะวันตก'
  ],
  constant: provinces
};
