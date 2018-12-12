'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const Moment = use('App/Utils/Moment');

// created with entity default
const PENDING_STATUS = 0;

// changed, lot start time become
const IN_PROCESS_STATUS = 1;

// closed, lot time end
const CLOSED_STATUS = 2;

class Lot extends Model {
  static formatType () {
    return 'YYYY-MM-DD HH:mm:ss';
  }

  static scopeInProcess (query) {
    return query.where('status', IN_PROCESS_STATUS);
  }

  static scopeInPending (query) {
    return query.where('status', PENDING_STATUS);
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
    return this.status === PENDING_STATUS;
  }

  statusProcessing () {
    this.status = IN_PROCESS_STATUS;
  }

  statusClosed () {
    this.status = CLOSED_STATUS;
  }
}

module.exports = Lot;
module.exports.PENDING_STATUS = PENDING_STATUS;
module.exports.IN_PROCESS_STATUS = IN_PROCESS_STATUS;
module.exports.CLOSED_STATUS = CLOSED_STATUS;
