'use strict';

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env');

module.exports = {
  login: Env.get('MAIL_LOGIN'),
  password: Env.get('MAIL_PASSWORD'),

  sender: Env.get('MAIL_SENDER'),
};
