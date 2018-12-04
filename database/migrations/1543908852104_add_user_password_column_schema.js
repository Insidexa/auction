'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class AddUserPasswordColumnSchema extends Schema {
  up () {
    this.table('users', (table) => {
      table.string('password').notNullable();
    });
  }

  down () {
    this.table('users', (table) => {
      table.dropColumn('password');
    });
  }
}

module.exports = AddUserPasswordColumnSchema;
