'use strict';

const moment = require('moment');

async function lotCheckStartDate (data, field, message, args, get) {
  const startDate = moment(get(data, field));
  const currentDate = moment();

  if (startDate.isSameOrBefore(currentDate)) {
    throw new Error(`${field} must more current date`);
  }
}

module.exports = lotCheckStartDate;
