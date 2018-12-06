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

Factory.blueprint('App/Models/User', (faker, i, data) => ({
  email: data.email ? data.email : faker.email(),
  phone: faker.phone(),
  first_name: faker.first(),
  lastname: faker.last(),
  birth_day: faker.date({ string: true }),
  password: data.password ? data.password : faker.password(),
  email_confirmed: data.email_confirmed ? data.email_confirmed : false,
}));

Factory.blueprint('App/Models/Lot', (faker, i, data) => ({
  title: faker.sentence({ words: 5 }),
  description: faker.paragraph(),
  image: '/images/example_image.jpg',
  status: data.status,
  user_id: data.user_id,
  current_price: 10.33,
  estimated_price: 2000,
  start_time: data.start_time,
  end_time: data.end_time,
}));
