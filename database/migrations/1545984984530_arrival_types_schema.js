'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ArrivalTypesSchema extends Schema {
  up () {
    this.create('arrival_types', (table) => {
      table.increments();

      table.string('name').notNullable().unique();
      table.integer('delivery_type_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('delivery_types');

      table.timestamps();
    });
  }

  down () {
    this.drop('arrival_types');
  }
}

module.exports = ArrivalTypesSchema;
