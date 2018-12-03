'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

// created with entity default
const PENDING_STATUS = 0;

// changed, lot start time become
const IN_PROCESS_STATUS = 1;

// closed, lot time end
const CLOSED_STATUS = 2;

class Lot extends Model {
  user () {
    return this.belongsTo('App/Models/User');
  }
}

module.exports = Lot;
module.exports = PENDING_STATUS;
module.exports = IN_PROCESS_STATUS;
module.exports = CLOSED_STATUS;
