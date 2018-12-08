'use strict';

const Kue = use('Kue');
const LotJob = use('App/Jobs/UpdateLotProgressOnStartTime');
const Task = use('Task');
const Lot = use('App/Models/Lot');

class LotCheckStartTime extends Task {
  static get schedule () {
    // every minutes
    return '1 * * * * *';
  }

  async handle () {
    this.info('Run job update lot status when start time it starting');
    const pendingLots = await Lot
      .query()
      .inPending()
      .select('id', 'start_time')
      .fetch();

    Kue.dispatch(LotJob.key, pendingLots.rows, {
      priority: 'normal',
      attempts: 1,
      remove: true,
    });
  }
}

module.exports = LotCheckStartTime;
