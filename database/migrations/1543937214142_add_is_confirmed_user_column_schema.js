'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class AddIsConfirmedUserColumnSchema extends Schema {
  up () {
    this.table('users', (table) => {
      table.boolean('email_confirmed').defaultTo(false);
    });
  }

  down () {
    this.table('users', (table) => {
      table.dropColumn('email_confirmed');
    });
  }
}

module.exports = AddIsConfirmedUserColumnSchema;
