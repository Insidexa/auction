'use strict';

const Logger = use('Logger');
const Lot = use('App/Models/Lot');

class UpdateLotProgressOnStartTime {
  // If this getter isn't provided, it will default to 1.
  // Increase this number to increase processing concurrency.
  static get concurrency () {
    return 1;
  }

  // This is required. This is a unique key used to identify this job.
  static get key () {
    return 'UpdateLotProgressOnStartTime-job';
  }

  // This is where the work is done.
  async handle (lots) {
    Logger.info('UpdateLotProgressOnStartTime-job started');

    const needStartLots = this.filterLotGetStartedTime(lots);

    Logger.info('Count lots to affecting: %s', needStartLots.length);

    needStartLots.forEach(async ({ id }) => {
      const lot = await Lot.find(id);
      lot.openForSales();
      await lot.save();
    });
  }

  filterLotGetStartedTime (lots) {
    return lots.filter(lot => UpdateLotProgressOnStartTime.isLetStartLot(lot));
  }

  static isLetStartLot (lot) {
    const currentDate = new Date();
    const lotStartDate = new Date(lot.start_time);

    return currentDate >= lotStartDate;
  }
}

module.exports = UpdateLotProgressOnStartTime;
