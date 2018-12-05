'use strict';

class PasswordRecovery {
  get rules () {
    return {
      email: 'required|email|exists:users,email',
    };
  }
}

module.exports = PasswordRecovery;
