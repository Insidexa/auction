'use strict';

class SignUp {
  get rules () {
    return {
      password: 'required|min:8',
      email: 'required|email|unique:users',
      phone: 'required|unique:users',
      first_name: 'required|min:3',
      lastname: 'required|min:3',
      birth_day: 'required|date|ageCheck:more:21',
    };
  }
}

module.exports = SignUp;