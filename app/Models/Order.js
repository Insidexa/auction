'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Order extends Model {
  static scopeFindByRelatedUser (query, userId) {
    return query.andWhere(function() {
      this
        .where('user_id', userId)
        .orWhereHas('lot', (builder) => {
          builder.where('user_id', userId);
        });
    });
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

  isAddressFilled () {
    return this.arrival_type_id && this.arrival_location;
  }
}

Order.PENDING_STATUS = 0;
Order.SEND_STATUS = 1;
Order.DELIVERED_STATUS = 2;

Order.SELLER = 'seller';
Order.CUSTOMER = 'customer';

module.exports = Order;
