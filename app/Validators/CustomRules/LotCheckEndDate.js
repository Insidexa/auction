'use strict';

const moment = require('moment');

async function lotCheckEndDate (data, field, message, args, get) {
  const endDate = moment(get(data, field));
  const [startDateFieldName] = args;
  const startDate = moment(get(data, startDateFieldName));

  if (endDate.isBefore(startDate)) {
    throw new Error(`${field} must more ${startDateFieldName}`);
  }
}

module.exports = lotCheckEndDate;
