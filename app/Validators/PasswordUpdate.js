'use strict';

class PasswordUpdate {
  get rules () {
    return {
      password: 'required|min:8|confirmed',
    };
  }

  get validateAll () {
    return true;
  }
}

module.exports = PasswordUpdate;
