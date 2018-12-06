'use strict';

class PasswordUpdate {
  get rules () {
    return {
      password: 'required|min:8|password_confirmation',
      password_confirmation: 'required|min:8',
    };
  }
}

module.exports = PasswordUpdate;
