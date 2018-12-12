'use strict';

const Logger = use('Logger');
const Lot = use('App/Models/Lot');
const Moment = use('App/Utils/Moment');

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

    const needStartLots = this.filterLotsGetStartedTime(lots);

    Logger.info('Count lots to affecting: %s', needStartLots.length);

    // eslint-disable-next-line no-restricted-syntax
    for (const { id } of needStartLots) {
      const lot = await Lot.find(id);
      lot.statusProcessing();
      lot.save();
    }
  }

  filterLotsGetStartedTime (lots) {
    return lots.filter(lot => UpdateLotProgressOnStartTime.isNeedStartLot(lot));
  }

  static isNeedStartLot (lot) {
    const currentDate = Moment();
    const lotStartDate = Moment(lot.start_time);

    return currentDate.isSameOrAfter(lotStartDate);
  }
}

module.exports = UpdateLotProgressOnStartTime;
