'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Order extends Model {
  user () {
    return this.belongsTo('App/Models/User');
  }
}

Order.PENDING_STATUS = 0;
Order.SEND_STATUS = 1;
Order.DELIVERED_STATUS = 2;

module.exports = Order;
