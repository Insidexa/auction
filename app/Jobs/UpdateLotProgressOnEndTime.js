'use strict';

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

    const needStartLots = this.filterLotGetEndTime(lots);

    Logger.info('Count lots to affecting: %s', needStartLots.length);

    needStartLots.forEach(async ({ id }) => {
      const lot = await Lot.find(id);
      lot.close();
      await lot.save();
    });
  }

  filterLotGetEndTime (lots) {
    return lots.filter(lot => UpdateLotProgressOnEndTime.isLetEndLot(lot));
  }

  static isLetEndLot (lot) {
    const currentDate = new Date();
    const lotEndDate = new Date(lot.end_time);

    return currentDate >= lotEndDate;
  }
}

module.exports = UpdateLotProgressOnEndTime;
