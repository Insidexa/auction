'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class ArrivalType extends Model {
  deliveryType () {
    return this.belongsTo('App/Models/DeliveryType');
  }
}

module.exports = ArrivalType;
