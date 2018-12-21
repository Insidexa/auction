'use strict';

/* eslint-disable no-throw-literal */

const Lot = use('App/Models/Lot');
const Bid = use('App/Models/Bid');

async function bidPriceRule (data, field, message, args, get) {
  const proposedPrice = get(data, 'proposed_price');
  const lotId = get(data, 'lot_id');
  let lot = null;
  try {
    lot = await Lot.query().inProcess().where('id', lotId).firstOrFail();
  } catch (e) {
    throw `Lot ${lotId} not found`;
  }

  if (proposedPrice < lot.current_price) {
    throw 'Your propose must more lot current price';
  }

  const bidMaxPriceLot = await Bid.query().withMaxPriceOnLot(lotId).first();
  if (bidMaxPriceLot && proposedPrice < bidMaxPriceLot.proposed_price) {
    throw 'Your propose must more previous bid propose';
  }
}

module.exports = bidPriceRule;
