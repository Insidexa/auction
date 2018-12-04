'use strict';

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash');

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const { ioc } = require('@adonisjs/fold');
const uuidv4 = require('uuid/v4');

class User extends Model {
  static get hidden () {
    return ['password'];
  }

  static boot () {
    super.boot();

    /**
     * A hook to hash the user password before saving
     * it to the database.
     */
    this.addHook('beforeSave', async (userInstance) => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password);
      }
    });

    this.addHook('afterCreate', async (userInstance) => {
      userInstance.confirmEmail();
    });
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens () {
    return this.hasMany('App/Models/Token');
  }

  lots () {
    return this.hasMany('App/Models/Lot');
  }

  bids () {
    return this.hasMany('App/Models/Bid');
  }

  async confirmEmail () {
    const NotificationDto = use('App/Dto/NotificationDto');
    const Token = use('App/Models/Token');
    const notification = ioc.use('App/Notification');

    const token = new Token();
    token.user_id = this.id;
    token.type = Token.CONFIRMATION_TOKEN;
    token.token = uuidv4(this.email);
    this.tokens().save(token);

    notification.send(
      new NotificationDto(
        this.email,
        'Confirm your email',
        this.generateConfirmHTML(token),
      ),
      (info) => {
        console.log(info);
      },
    );
  }

  generateConfirmHTML (token) {
    return `Confirm Email with clicked <a href="front-url/${token.token}">this link</a>`;
  }

  active () {
    this.email_confirmed = true;
  }
}

module.exports = User;
