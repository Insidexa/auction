'use strict';

const uuidv4 = require('uuid/v4');
const { ioc } = require('@adonisjs/fold');

const Hash = use('Hash');
const Model = use('Model');
const NotificationDto = use('App/Dto/NotificationDto');
const Token = use('App/Models/Token');

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
    const notification = ioc.use('App/Notification');
    const token = new Token();

    token.user_id = this.id;
    token.type = Token.CONFIRMATION_TOKEN;
    token.token = uuidv4(this.email);
    await this.tokens().save(token);

    await notification.send(
      new NotificationDto(
        this.email,
        'Confirm your email',
        this.generateConfirmHTML(token),
      ),
    );
  }

  generateConfirmHTML (token) {
    return `Confirm Email with clicked <a href="front-url/${token.token}">this link</a>`;
  }

  emailConfirmed () {
    this.email_confirmed = true;
  }

  isConfirmed () {
    return this.email_confirmed === true;
  }

  isNotConfirmed () {
    return this.email_confirmed === false;
  }

  async createPasswordToken () {
    const token = new Token();

    token.user_id = this.id;
    token.type = Token.PASSWORD_TOKEN;
    token.token = uuidv4(this.email);
    await this.tokens().save(token);

    return token;
  }

  async passwordRecoverySend (token) {
    const notification = ioc.use('App/Notification');

    await notification.send(
      new NotificationDto(
        this.email,
        'Password recovery',
        this.generatePasswordRecoveryHTML(token),
      ),
    );
  }

  generatePasswordRecoveryHTML (token) {
    return `Click <a href="password/recovery/${token.token}">this link</a> to password recovery`;
  }
}

module.exports = User;
