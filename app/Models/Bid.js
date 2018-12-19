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

  static scopeWithMaxPriceOnLot (query, lotId) {
    return query
      .where('lot_id', lotId)
      .orderBy('proposed_price', 'desc');
  }
}

module.exports = Bid;
