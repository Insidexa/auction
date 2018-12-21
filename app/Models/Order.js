'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Order extends Model {
  static boot () {
    super.boot();

    this.addHook('afterCreate', 'OrderHook.afterCreate');
  }

  user () {
    return this.belongsTo('App/Models/User');
  }

  lot () {
    return this.belongsTo('App/Models/Lot');
  }

  bid () {
    return this.belongsTo('App/Models/Bid');
  }
}

Order.PENDING_STATUS = 0;
Order.SEND_STATUS = 1;
Order.DELIVERED_STATUS = 2;

module.exports = Order;
