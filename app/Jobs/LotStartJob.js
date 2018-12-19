'use strict';

const Lot = use('App/Models/Lot');

class LotStartJob {
  static get name () {
    return 'LotStart';
  }

  async handle (job, done) {
    const lot = await Lot.find(job.data.id);
    lot.setInProcessStatus();
    await lot.save();
    done();
  }
}

module.exports = LotStartJob;
