'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ChangeTypePricesLotColumnsToFloatSchema extends Schema {
  up () {
    this.table('lots', (table) => {
      table.dropColumns(['current_price', 'estimated_price']);
    });
    this.table('lots', (table) => {
      table.float('current_price', 2).notNullable();
      table.float('estimated_price', 2).notNullable();
    });
  }

  down () {
    this.table('lots', (table) => {
      table.dropColumns(['current_price', 'estimated_price']);
    });
    this.table('lots', (table) => {
      table.decimal('current_price', 8, 2).notNullable();
      table.decimal('estimated_price', 8, 2).notNullable();
    });
  }
}

module.exports = ChangeTypePricesLotColumnsToFloatSchema;
