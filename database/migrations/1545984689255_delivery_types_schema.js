'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class DeliveryTypesSchema extends Schema {
  up () {
    this.create('delivery_types', (table) => {
      table.increments();

      table.string('name').notNullable().unique();

      table.timestamps();
    });
  }

  down () {
    this.drop('delivery_types');
  }
}

module.exports = DeliveryTypesSchema;
