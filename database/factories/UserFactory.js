'use strict';

const Moment = use('App/Utils/Moment');

module.exports = (chance, i, data) => ({
  email: chance.email(),
  phone: chance.phone(),
  first_name: chance.first(),
  lastname: chance.last(),
  birth_day: Moment().subtract(chance.integer({
    min: 19,
    max: 24,
  }), 'years').format('YYYY-MM-DD'),
  password: chance.password(),
  email_confirmed: false,
  ...data,
});
