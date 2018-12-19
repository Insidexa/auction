'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Bid extends Model {
  user () {
    return this.belongsTo('App/Models/User');
  }

  lot () {
    return this.belongsTo('App/Models/Lot');
  }

  getProposedPrice (price) {
    return parseFloat(price);
  }

  static scopeBidWithMaxPriceOnLot (query, lotId) {
    return query
      .where('lot_id', lotId)
      .orderBy('proposed_price', 'desc')
      .limit(1);
  }
}

module.exports = Bid;
