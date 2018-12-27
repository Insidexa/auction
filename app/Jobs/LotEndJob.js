'use strict';

const Event = use('Event');
const Lot = use('App/Models/Lot');
const Order = use('App/Models/Order');

class LotEndJob {
  static get name () {
    return 'LotEnd';
  }

  async handle (job, done) {
    const lot = await Lot.find(job.data.id);

    const bidLotWinner = await lot.bids().withMaxPriceOnLot().first();
    if (bidLotWinner) {
      const bidUser = await bidLotWinner.user().fetch();
      await Order.create({
        user_id: bidUser.id,
        bid_id: bidLotWinner.id,
        lot_id: lot.id,
      });
      Event.fire('order::onWinner', { user: bidUser, lot, bid: bidLotWinner });
    }

    lot.setInClosedStatus();
    await lot.save();
    done();
  }
}

module.exports = LotEndJob;
