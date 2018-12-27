'use strict';

const Event = use('Event');
const Lot = use('App/Models/Lot');
const Bid = use('App/Models/Bid');
const Order = use('App/Models/Order');
const ResponseDto = use('App/Dto/ResponseDto');

class BidController {
  async store ({
    request, response, auth,
  }) {
    const { user } = auth;
    const bidRequestData = this.filterBidFields(request);
    const lot = await Lot.query().inProcess().where('id', bidRequestData.lot_id).first();
    const bid = await Bid.create({ ...bidRequestData, user_id: user.id });
    const isWinner = bid.proposed_price >= lot.estimated_price;

    if (isWinner) {
      lot.setInClosedStatus();
      await lot.save();
      await Order.create({
        user_id: user.id,
        bid_id: bid.id,
        lot_id: bidRequestData.lot_id,
      });
      Event.fire('order::onWinner', { user, lot, bid });
    }

    bid.isWinner = isWinner;
    return response.send(ResponseDto.success(
      bid,
    ));
  }

  filterBidFields (request) {
    return request.only([
      'proposed_price',
      'lot_id',
    ]);
  }
}

module.exports = BidController;
