'use strict';

const BaseValidator = use('App/Validators/BaseValidator');
const Moment = use('App/Utils/Moment');

class SignUp extends BaseValidator {
  get rules () {
    const minAge = Moment().subtract(21, 'years').format('YYYY-MM-DD');

    return {
      password: 'required|min:8|confirmed',
      email: 'required|email|unique:users',
      phone: 'required|unique:users',
      first_name: 'required|min:3',
      lastname: 'required|min:3',
      birth_day: `required|date|before:${minAge}`,
    };
  }
}

module.exports = SignUp;
