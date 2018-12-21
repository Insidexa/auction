'use strict';

const Event = use('Event');
const Lot = use('App/Models/Lot');
const BidWinnerService = use('BidWinnerService');

class LotEndJob {
  static get name () {
    return 'LotEnd';
  }

  async handle (job, done) {
    const lot = await Lot.find(job.data.id);

    const bidLotWinner = await BidWinnerService.getWinnerBid(lot);
    if (bidLotWinner) {
      const bidUser = await bidLotWinner.user().fetch();
      await BidWinnerService.createLotOrder(lot, bidLotWinner, bidUser);
      Event.fire('order::onWinner', { user: bidUser, lot, bid: bidLotWinner });
    }

    lot.setInClosedStatus();
    await lot.save();
    done();
  }
}

module.exports = LotEndJob;
