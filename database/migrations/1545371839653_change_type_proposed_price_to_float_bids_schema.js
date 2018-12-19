'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ChangeTypeProposedPriceToFloatBidsSchema extends Schema {
  up () {
    this.table('bids', (table) => {
      table.dropColumn('proposed_price');
    });
    this.table('bids', (table) => {
      table.float('proposed_price', 2).notNullable();
    });
  }

  down () {
    this.table('bids', (table) => {
      table.dropColumn('proposed_price');
    });
    this.table('bids', (table) => {
      table.decimal('proposed_price', 8, 2).notNullable();
    });
  }
}

module.exports = ChangeTypeProposedPriceToFloatBidsSchema;
