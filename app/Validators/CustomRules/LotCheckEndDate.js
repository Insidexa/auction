'use strict';

const Moment = use('App/Utils/Moment');

async function lotCheckEndDate (data, field, message, args, get) {
  const endDate = Moment(get(data, field));
  const [startDateFieldName] = args;
  const startDate = Moment(get(data, startDateFieldName));

  if (endDate.isBefore(startDate)) {
    throw new Error(`${field} must more ${startDateFieldName}`);
  }
}

module.exports = lotCheckEndDate;
