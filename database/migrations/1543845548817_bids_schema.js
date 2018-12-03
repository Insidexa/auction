'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class BidsSchema extends Schema {
  up () {
    this.create('bids', (table) => {
      table.increments();

      table.decimal('proposed_price', 8, 2).notNullable();
      table.datetime('creation_time').notNullable();

      table.integer('user_id').notNullable();
      table.integer('lot_id').notNullable();

    });
  }

  down () {
    this.drop('bids');
  }
}

module.exports = BidsSchema;
