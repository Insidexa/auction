'use strict';

const BaseValidator = use('App/Validators/BaseValidator');

class PasswordUpdate extends BaseValidator {
  get rules () {
    return {
      password: 'required|min:8|confirmed',
    };
  }
}

module.exports = PasswordUpdate;
