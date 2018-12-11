'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class OrdersSchema extends Schema {
  up () {
    this.create('orders', (table) => {
      table.increments();

      table.text('arrival_location').notNullable();
      table.string('arrival_type').notNullable();
      table.integer('status').notNullable();

      table.integer('bid_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users');
      table.integer('lot_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users');
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
