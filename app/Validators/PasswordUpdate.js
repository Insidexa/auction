'use strict';

class PasswordUpdate {
  get rules () {
    return {
      password: 'required|min:8',
      password_confirmation: 'required_if:password',
    };
  }
}

module.exports = PasswordUpdate;
