'use strict';

/* eslint-disable camelcase */

const Event = use('Event');
const Lot = use('App/Models/Lot');
const Bid = use('App/Models/Bid');
const ResponseDto = use('App/Dto/ResponseDto');
const BidWinnerService = use('BidWinnerService');
const BidPriceSmallerException = use('App/Exceptions/BidPriceSmallerException');

class BidController {
  async store ({
    request, response, auth,
  }) {
    const bidRequestData = this.filterBidFields(request);
    const bidProposedPrice = bidRequestData.proposed_price;
    const lot = await Lot.query().inProcess().where('id', bidRequestData.lot_id).firstOrFail();
    const { user } = auth;

    if (lot.user_id === user.id) {
      return response.status(403).send(ResponseDto.error(
        'CannotBuyYourselfLot',
      ));
    }

    if (bidProposedPrice < lot.current_price) {
      throw new BidPriceSmallerException(lot.current_price, 422);
    }

    const bidMaxPriceLot = await Bid.query().withMaxPriceOnLot(lot.id).first();
    if (bidMaxPriceLot && bidProposedPrice < bidMaxPriceLot.proposed_price) {
      throw new BidPriceSmallerException(bidMaxPriceLot.proposed_price, 422);
    }

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
