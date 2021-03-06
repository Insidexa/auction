'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments();
      table.string('email', 254).notNullable().unique();
      table.string('phone', 20).notNullable().unique();
      table.string('first_name', 50).notNullable();
      table.string('lastname', 50).notNullable();
      table.date('birth_day', 60).notNullable();

      table.timestamps();
    });
  }

  down () {
    this.drop('users');
  }
}

module.exports = UserSchema;
