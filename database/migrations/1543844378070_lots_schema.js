'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class LotsSchema extends Schema {
  up () {
    this.create('lots', (table) => {
      table.increments();
      table.string('title').notNullable();
      table.string('image');
      table.text('description');
      table.integer('status').notNullable();
      table.decimal('current_price', 8, 2).notNullable();
      table.decimal('estimated_price', 8, 2).notNullable();
      table.datetime('start_time').notNullable();
      table.datetime('end_time').notNullable();

      table.integer('user_id').notNullable();

      table.timestamps();
    });
  }

  down () {
    this.drop('lots');
  }
}

module.exports = LotsSchema;
