'use strict';

const _ = require('lodash');
const { Province, Region } = require('../models');
const provincesByRegion = require("../utils/constants/provinces_by_region.json");

/**
 * Make any changes you need to make to the database here
 */
async function up () {
  try {
    // reset first
    // await Province.deleteMany();
    // await Region.deleteMany();
    
    await Region.insertMany(Object.keys(provincesByRegion).map(region => ({ _id: region })));
    let provinces = [];
    _.forEach(provincesByRegion, (value, key) => {
      provinces = provinces.concat(value.map(province => ({ _id: province, regionId: key })));
    });
    await Province.insertMany(provinces);
  } catch (error) {
    console.error(error);
  }
}

/**
 * 
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down () {
  // Write migration here
}

module.exports = { up, down };
