'use strict';

const BaseValidator = use('App/Validators/BaseValidator');

class PasswordRecovery extends BaseValidator {
  get rules () {
    return {
      email: 'required|email',
    };
  }
}

module.exports = PasswordRecovery;
