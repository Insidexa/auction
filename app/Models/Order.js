'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

// waiting while seller accept customer’s order
const PENDING_STATUS = 0;

// means that seller accept order and the process of product’s delivering has been started
const SEND_STATUS = 1;

//  user setup this status after he got product
const DELIVERED_STATUS = 2;

class Order extends Model {
  user () {
    return this.belongsTo('App/Models/User');
  }
}

module.exports = Order;
module.exports.PENDING_STATUS = PENDING_STATUS;
module.exports.SEND_STATUS = SEND_STATUS;
module.exports.DELIVERED_STATUS = DELIVERED_STATUS;
