'use strict';

/* eslint-disable camelcase */

const Event = use('Event');
const Lot = use('App/Models/Lot');
const Bid = use('App/Models/Bid');
const ResponseDto = use('App/Dto/ResponseDto');
const BidWinnerService = use('BidWinnerService');

class BidController {
  async store ({
    params, request, response, auth,
  }) {
    const bidRequest = this.filterBidFields(request);
    const lot = await Lot.query()
      .inProcess()
      .where('id', params.lotId)
      .firstOrFail();
    const [row] = await Bid.query().where('lot_id', lot.id).max('proposed_price');

    if (bidRequest.proposed_price < row.max) {
      return response.status(400).send(ResponseDto.error(
        'ProposedPriceMustGreater',
        `Proposed price be greater than ${row.max}`,
      ));
    }

    const { user } = auth;
    const { isWinner, bid } = await BidWinnerService.checkWinner({
      user, lot, bidRequest,
    });

    if (isWinner) {
      await BidWinnerService.setupLotWinner(lot, {
        bid_id: bid.id,
        user_id: user.id,
      });
      Event.fire('bid::onWinner', { bid, lot });
      Event.fire('lot::onBidWinner', { bid, lot });
    }

    return response.send(ResponseDto.success(
      { bid, isWinner },
    ));
  }

  filterBidFields (request) {
    return request.only([
      'proposed_price',
    ]);
  }
}

module.exports = BidController;
