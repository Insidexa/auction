'use strict';

const Kue = use('Kue');
const LotJob = use('App/Jobs/UpdateLotProgressOnEndTime');
const Task = use('Task');
const Lot = use('App/Models/Lot');

class LotCheckEndTime extends Task {
  static get schedule () {
    return '1 * * * * *';
  }

  async handle () {
    this.info('Run job update lot status when end time');
    const pendingLots = await Lot
      .query()
      .select('id', 'end_time')
      .inProcess()
      .fetch();

    Kue.dispatch(LotJob.key, pendingLots.rows, {
      priority: 'normal',
      attempts: 1,
      remove: true,
    });
  }
}

module.exports = LotCheckEndTime;
