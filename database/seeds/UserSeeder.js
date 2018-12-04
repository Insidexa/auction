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

class UserSeeder {
  async run () {
    // https://eslint.org/docs/rules/no-plusplus
    for (let i = 0; i < 10; i++) {
      await Factory.model('App/Models/User').create();
    }

    await Factory.model('App/Models/User').create({
      password: '12345',
      email: 'example@g.com',
    });
  }
}

module.exports = UserSeeder;
