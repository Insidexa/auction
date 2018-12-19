'use strict';

const Model = use('Model');
const Moment = use('App/Utils/Moment');

class User extends Model {
  static get hidden () {
    return ['password'];
  }

  static boot () {
    super.boot();

    this.addHook('beforeSave', 'UserHook.beforeSave');
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

  getBirthDay (birthDay) {
    return Moment(birthDay).format('YYYY-MM-DD HH:mm:ss');
  }
}

module.exports = User;
