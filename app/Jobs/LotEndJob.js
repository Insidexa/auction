'use strict';

const Lot = use('App/Models/Lot');

class LotEndJob {
  static get name () {
    return 'LotEnd';
  }

  async handle (job, done) {
    const lot = await Lot.find(job.data.id);
    lot.setInClosedStatus();
    await lot.save();
    done();
  }
}

module.exports = LotEndJob;
