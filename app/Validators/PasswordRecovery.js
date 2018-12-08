'use strict';

class PasswordRecovery {
  get rules () {
    return {
      email: 'required|email|exists:users,email',
    };
  }

  get validateAll () {
    return true;
  }
}

module.exports = PasswordRecovery;
