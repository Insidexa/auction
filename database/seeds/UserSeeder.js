'use strict';

/*
|--------------------------------------------------------------------------
| UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');
const Database = use('Database');

class UserSeeder {
  async run () {
    await Database.table('tokens').delete();
    await Database.table('users').delete();

    // https://eslint.org/docs/rules/no-plusplus
    for (let i = 0; i < 10; i++) {
      await Factory.model('App/Models/User').create();
    }

    await Factory.model('App/Models/User').create({
      password: '12345678',
      email: 'example@g.com',
      email_confirmed: false,
    });

    await Factory.model('App/Models/User').create({
      password: '12345678',
      email: 'example1@g.com',
      email_confirmed: true,
    });
  }
}

module.exports = UserSeeder;
