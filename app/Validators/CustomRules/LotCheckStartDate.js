'use strict';

const Moment = use('App/Utils/Moment');

async function lotCheckStartDate (data, field, message, args, get) {
  const startDate = Moment(get(data, field));
  const currentDate = Moment();

  if (startDate.isSameOrBefore(currentDate)) {
    throw new Error(`${field} must more current date`);
  }
}

module.exports = lotCheckStartDate;
