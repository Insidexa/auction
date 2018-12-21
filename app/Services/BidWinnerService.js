'use strict';

const Bid = use('App/Models/Bid');
const Order = use('App/Models/Order');

class BidWinnerService {
  async createBid ({ user, bidRequestData }) {
    return await Bid.create({
      ...bidRequestData,
      user_id: user.id,
    });
  }

  isWinner (lot, bid) {
    return bid.proposed_price >= lot.estimated_price;
  }

  async getWinnerBid (lot) {
    return await lot.bids().withMaxPriceOnLot().first();
  }

  async createLotOrder (lot, bid, user) {
    const order = await Order.create({
      user_id: user.id,
      bid_id: bid.id,
      lot_id: lot.id,
    });

    lot.setInClosedStatus();
    await lot.save();

    return order;
  }
}

module.exports = BidWinnerService;
