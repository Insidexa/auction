'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class AddLotWinnerColumnSchema extends Schema {
  up () {
    this.table('lots', (table) => {
      table.json('winner_data').nullable();
    });
  }

  down () {
    this.table('lots', (table) => {
      table.dropColumn('winner_data');
    });
  }
}

module.exports = AddLotWinnerColumnSchema;
