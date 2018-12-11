'use strict';

const moment = require('moment');

const Logger = use('Logger');
const Lot = use('App/Models/Lot');

class UpdateLotProgressOnEndTime {
  // If this getter isn't provided, it will default to 1.
  // Increase this number to increase processing concurrency.
  static get concurrency () {
    return 1;
  }

  // This is required. This is a unique key used to identify this job.
  static get key () {
    return 'UpdateLotProgressOnEndTime-job';
  }

  // This is where the work is done.
  async handle (lots) {
    Logger.info('UpdateLotProgressOnEndTime-job started');

    const needStartLots = this.filterLotsGetEndTime(lots);

    Logger.info('Count lots to affecting: %s', needStartLots.length);

    // eslint-disable-next-line no-restricted-syntax
    for (const { id } of needStartLots) {
      const lot = await Lot.find(id);
      lot.statusClosed();
      lot.save();
    }
  }

  filterLotsGetEndTime (lots) {
    return lots.filter(lot => UpdateLotProgressOnEndTime.isNeedCloseLot(lot));
  }

  static isNeedCloseLot (lot) {
    const currentDate = moment();
    const lotEndDate = moment(lot.end_time);

    return currentDate.isSameOrAfter(lotEndDate);
  }
}

module.exports = UpdateLotProgressOnEndTime;
