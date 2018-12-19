'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class OrdersSchema extends Schema {
  up () {
    this.create('orders', (table) => {
      table.increments();

      table.text('arrival_location').nullable();
      table.string('arrival_type').nullable();
      table.integer('status').notNullable().defaultTo(0);

      table.integer('bid_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('bids');
      table.integer('lot_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('lots');
      table.integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users');

      table.timestamps();
    });
  }

  down () {
    this.drop('orders');
  }
}

module.exports = OrdersSchema;
