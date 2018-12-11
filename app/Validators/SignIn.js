'use strict';

class SignIn {
  get rules () {
    return {
      email: 'required|email|exists:users,email',
      password: 'required|min:8',
    };
  }

  get validateAll () {
    return true;
  }
}

module.exports = SignIn;
