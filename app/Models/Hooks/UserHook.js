'use strict';

const Hash = use('Hash');

class UserHook {
  async beforeSave (user) {
    if (user.dirty.password) {
      user.password = await Hash.make(user.password);
    }
  }
}

module.exports = UserHook;
