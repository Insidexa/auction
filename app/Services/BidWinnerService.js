'use strict';

const Bid = use('App/Models/Bid');

class BidWinnerService {
  async createBid ({ user, lot, bidRequest }) {
    const bid = new Bid();
    bid.fill(bidRequest);
    bid.user_id = user.id;
    bid.lot_id = lot.id;
    await lot.bids().save(bid);

    return bid;
  }

  isWinner (lot, bid) {
    const isWinner = bid.proposed_price === parseFloat(lot.estimated_price);
    return { isWinner, bid };
  }

  async getWinnerBid (lot) {
    return await Bid.query().bidWithMaxPriceOnLot(lot.id).first();
  }

  async setupLotWinner (lot, winnerData) {
    lot.winner_data = winnerData;
    lot.setInClosedStatus();
    await lot.save();
    // TODO: add removing lotEndJob in job branch

    return lot;
  }

  async checkWinner ({ user, lot, bidRequest }) {
    const bid = await this.createBid({ user, lot, bidRequest });
    return this.isWinner(lot, bid);
  }
}

module.exports = BidWinnerService;
