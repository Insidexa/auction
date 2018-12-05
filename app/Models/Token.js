'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

const CONFIRMATION_TOKEN = 'confirmation';

const PASSWORD_TOKEN = 'password';

const REMEMBER_TOKEN = 'remember';

class Token extends Model {
  isActive () {
    return !this.is_revoked;
  }

  static scopePasswordToken (query) {
    return query.where('type', PASSWORD_TOKEN);
  }

  static scopeConfirmToken (query) {
    return query.where('type', CONFIRMATION_TOKEN);
  }

  user () {
    return this.belongsTo('App/Models/User');
  }
}

module.exports = Token;
module.exports.CONFIRMATION_TOKEN = CONFIRMATION_TOKEN;
module.exports.REMEMBER_TOKEN = REMEMBER_TOKEN;
module.exports.PASSWORD_TOKEN = PASSWORD_TOKEN;
