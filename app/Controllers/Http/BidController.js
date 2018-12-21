'use strict';

const Event = use('Event');
const Lot = use('App/Models/Lot');
const ResponseDto = use('App/Dto/ResponseDto');
const BidWinnerService = use('BidWinnerService');

class BidController {
  async store ({
    request, response, auth,
  }) {
    const bidRequestData = this.filterBidFields(request);
    const lot = await Lot.query().inProcess().where('id', bidRequestData.lot_id).first();
    const { user } = auth;
    const bid = await BidWinnerService.createBid({ user, bidRequestData });
    const isWinner = await BidWinnerService.isWinner(lot, bid);

    if (isWinner) {
      await BidWinnerService.createLotOrder(lot, bid, user);
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
