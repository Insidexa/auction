'use strict';

const { rule } = require('indicative');

const BaseValidator = use('App/Validators/BaseValidator');
const Moment = use('App/Utils/Moment');
const User = use('App/Models/User');

class SignUp extends BaseValidator {
  get rules () {
    const minAge = Moment().subtract(21, 'years').format(User.formatBirthDay);

    return {
      password: 'required|min:8|confirmed',
      email: 'required|email|unique:users',
      phone: 'required|unique:users',
      first_name: 'required|min:3',
      lastname: 'required|min:3',
      birth_day: [
        rule('required'),
        rule('dateFormat', User.formatBirthDay),
        rule('before', minAge),
      ],
    };
  }
}

module.exports = SignUp;
