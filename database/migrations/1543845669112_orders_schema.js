'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class OrdersSchema extends Schema {
  up () {
    this.create('orders', (table) => {
      table.increments();

      table.integer('bid_id').notNullable();
      table.integer('lot_id').notNullable();
      table.integer('user_id').notNullable();
      table.text('arrival_location').notNullable();
      table.string('arrival_type').notNullable();
      table.integer('status').notNullable();

      table.timestamps();
    });
  }

  down () {
    this.drop('orders');
  }
}

module.exports = OrdersSchema;
