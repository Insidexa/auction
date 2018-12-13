'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const Moment = use('App/Utils/Moment');

class Lot extends Model {
  static boot () {
    super.boot();

    this.addHook('beforeSave', 'LotHook.beforeSave');
    this.addHook('afterDelete', 'LotHook.afterDelete');
  }

  static formatType () {
    return 'YYYY-MM-DD HH:mm:ss';
  }

  static scopeInProcess (query) {
    return query.where('status', Lot.IN_PROCESS_STATUS);
  }

  static scopeInPending (query) {
    return query.where('status', Lot.PENDING_STATUS);
  }

  static scopeFilterByType (query, type, user) {
    switch (type) {
      case Lot.FILTER_BY_ALL:
        // TODO: add other lots
        return query;

      case Lot.FILTER_BY_CREATED:
        return query.where('user_id', user.id);

      case Lot.FILTER_BY_PARTICIPATION:
        return query;

      default:
        return query;
    }
  }

  getStartTime (time) {
    return Moment(time).format(Lot.formatType());
  }

  getEndTime (time) {
    return Moment(time).format(Lot.formatType());
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
}

Lot.PENDING_STATUS = 0;
Lot.IN_PROCESS_STATUS = 1;
Lot.CLOSED_STATUS = 2;

Lot.FILTER_BY_ALL = 'all';
Lot.FILTER_BY_CREATED = 'created';
Lot.FILTER_BY_PARTICIPATION = 'participation';

module.exports = Lot;
