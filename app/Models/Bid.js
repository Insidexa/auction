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

  static scopeWithMaxPriceOnLot (query) {
    return query
      .orderBy('proposed_price', 'desc');
  }
}

module.exports = Bid;
