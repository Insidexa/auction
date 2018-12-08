'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const TokenMaker = use('App/Services/TokenMaker');

// Token types
// confirmation user
const CONFIRMATION_TOKEN = 'confirmation';

// password reset
const PASSWORD_TOKEN = 'password';

class Token extends Model {
  static scopePasswordToken (query) {
    return query.where('type', PASSWORD_TOKEN);
  }

  static scopeConfirmToken (query) {
    return query.where('type', CONFIRMATION_TOKEN);
  }

  static scopeActive (query) {
    return query.where('is_revoked', false);
  }

  user () {
    return this.belongsTo('App/Models/User');
  }

  static async makeToken (user, type) {
    const token = new Token();
    token.type = type;
    token.user_id = user.id;
    token.token = TokenMaker.make();

    await user.tokens().save(token);

    return token;
  }
}

module.exports = Token;
module.exports.CONFIRMATION_TOKEN = CONFIRMATION_TOKEN;
module.exports.PASSWORD_TOKEN = PASSWORD_TOKEN;
