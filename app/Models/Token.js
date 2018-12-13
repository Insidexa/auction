'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const TokenMaker = use('TokenMaker');

class Token extends Model {
  static scopePasswordToken (query) {
    return query.where('type', Token.PASSWORD_TOKEN);
  }

  static scopeConfirmToken (query) {
    return query.where('type', Token.CONFIRMATION_TOKEN);
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

// Token types
Token.CONFIRMATION_TOKEN = 'confirmation';
Token.PASSWORD_TOKEN = 'password';

module.exports = Token;
