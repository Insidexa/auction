'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class AddTimestampsBidSchema extends Schema {
  up () {
    this.table('bids', (table) => {
      table.timestamps();
    });
  }

  down () {
    this.table('bids', (table) => {
      table.dropTimestamps();
    });
  }
}

module.exports = AddTimestampsBidSchema;
