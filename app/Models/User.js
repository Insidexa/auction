'use strict';

const Model = use('Model');

class User extends Model {
  static get hidden () {
    return ['password'];
  }

  static get formatBirthDay () {
    return 'YYYY-MM-DD';
  }

  static boot () {
    super.boot();

    this.addHook('beforeSave', 'UserHook.beforeSave');
  }

  static get dates () {
    return super.dates.concat(['birth_day']);
  }

  static castDates (field, value) {
    if (field === 'birth_day') {
      return value.format(User.formatBirthDay);
    }
    return super.formatDates(field, value);
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
}

module.exports = User;
