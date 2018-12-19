'use strict';

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');

Factory.blueprint('App/Models/User', (chance, i, data) => ({
  email: chance.email(),
  phone: chance.phone(),
  first_name: chance.first(),
  lastname: chance.last(),
  birth_day: chance.date({ string: true }),
  password: chance.password(),
  email_confirmed: false,
  ...data,
}));

Factory.blueprint('App/Models/Lot', (chance, i, data) => ({
  title: chance.sentence({ words: 5 }),
  description: chance.paragraph(),
  current_price: chance.integer({
    min: 10,
    max: 100,
  }),
  estimated_price: chance.integer({
    min: 100,
    max: 1000,
  }),
  image: data.image ? data.image : null,
  ...data,
}));

Factory.blueprint('App/Models/Bid', (chance, i, data) => ({
  proposed_price: chance.integer({
    min: 100,
    max: 1000,
  }),
  ...data,
}));
