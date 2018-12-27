'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class OrderNotNullableArrivalDataSchema extends Schema {
  up () {
    this.table('orders', (table) => {
      table.dropColumns(['arrival_location', 'arrival_type']);
    });
    this.table('orders', (table) => {
      table.string('arrival_location').nullable();
      table.integer('arrival_type_id')
        .unsigned()
        .references('id')
        .inTable('arrival_types');
    });
  }

  down () {
    this.table('orders', (table) => {
      table.dropColumns(['arrival_location', 'arrival_type_id']);
    });
    this.table('orders', (table) => {
      table.text('arrival_location').nullable();
      table.string('arrival_type').nullable();
    });
  }
}

module.exports = OrderNotNullableArrivalDataSchema;
