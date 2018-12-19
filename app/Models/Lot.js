'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Lot extends Model {
  static boot () {
    super.boot();

    this.addHook('beforeSave', 'LotHook.beforeSave');
    this.addHook('afterDelete', 'LotHook.afterDelete');
  }

  static get formatTimeType () {
    return 'YYYY-MM-DD HH:mm:ss';
  }

  static get dates () {
    return super.dates.concat([
      'start_time',
      'end_time',
    ]);
  }

  static castDates (field, value) {
    if (field === 'start_time' || field === 'end_time') {
      return value.format(Lot.formatTimeType);
    }
    return super.formatDates(field, value);
  }

  static scopeInProcess (query) {
    return query.where('status', Lot.IN_PROCESS_STATUS);
  }

  static scopeInPending (query) {
    return query.where('status', Lot.PENDING_STATUS);
  }

  static scopeFilterByType (query, type, user) {
    const userBidsQuery = function userBids () {
      this.select('lot_id').from('bids').where('user_id', user.id);
    };

    switch (type) {
      case Lot.FILTER_BY_ALL:
        return query
          .whereIn('id', userBidsQuery)
          .orWhere('user_id', user.id);

      case Lot.FILTER_BY_CREATED:
        return query.where('user_id', user.id);

      case Lot.FILTER_BY_PARTICIPATION:
        return query
          .whereIn('id', userBidsQuery)
          .whereNot('user_id', user.id);

      default:
        return query;
    }
  }

  user () {
    return this.belongsTo('App/Models/User');
  }

  isPending () {
    return this.status === Lot.PENDING_STATUS;
  }

  setInProcessStatus () {
    this.status = Lot.IN_PROCESS_STATUS;
  }

  setInClosedStatus () {
    this.status = Lot.CLOSED_STATUS;
  }

  bids () {
    return this.hasMany('App/Models/Bid');
  }

  order () {
    return this.hasOne('App/Models/Order');
  }

  async userIsWinner (user) {
    await this.load('order');
    const lotResponse = this.toJSON();
    return lotResponse.order ? lotResponse.order.user_id === user.id : false;
  }
}

Lot.PENDING_STATUS = 0;
Lot.IN_PROCESS_STATUS = 1;
Lot.CLOSED_STATUS = 2;

Lot.FILTER_BY_ALL = 'all';
Lot.FILTER_BY_CREATED = 'created';
Lot.FILTER_BY_PARTICIPATION = 'participation';

module.exports = Lot;
