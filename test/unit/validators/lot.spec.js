'use strict';

const {
  test, trait, before, after,
} = use('Test/Suite')('Lot Validation');
const Route = use('Route');
const Factory = use('Factory');
const User = use('App/Models/User');
const userCustomData = require('../../utils/userCustomData');
const { cleanUpDB } = require('../../utils/utils');

trait('Test/ApiClient');
trait('Auth/Client');

let user = null;
before(async () => {
  await Factory.model('App/Models/User').create({
    email: userCustomData.confirmedEmail,
    password: userCustomData.password,
    email_confirmed: true,
  });
  user = await User.findBy('email', userCustomData.confirmedEmail);
});

after(async () => {
  await cleanUpDB();
});

test('POST lots.store (validate fails), 422', async ({ client }) => {
  const response = await client
    .post(Route.url('lots.store'))
    .loginVia(user)
    .end();

  response.assertStatus(422);
  response.assertJSON({
    message: 'ValidationException',
    description: [
      {
        message: 'required validation failed on title',
        field: 'title',
        validation: 'required',
      },
      {
        message: 'required validation failed on current_price',
        field: 'current_price',
        validation: 'required',
      },
      {
        message: 'required validation failed on estimated_price',
        field: 'estimated_price',
        validation: 'required',
      },
      {
        message: 'required validation failed on start_time',
        field: 'start_time',
        validation: 'required',
      },
      {
        message: 'required validation failed on end_time',
        field: 'end_time',
        validation: 'required',
      },
    ],
  });
});

test('POST lots.store (validate fails custom rules), 422', async ({ client }) => {
  const response = await client
    .post(Route.url('lots.store'))
    .send({
      title: 'Lot title',
      current_price: 20.20,
      estimated_price: 100,
      start_time: '2018-10-10 12:00',
      end_time: '2018-10-10 10:00',
    })
    .loginVia(user)
    .end();

  response.assertStatus(422);
  response.assertJSON({
    message: 'ValidationException',
    description: [
      {
        message: 'dateFormat validation failed on start_time',
        field: 'start_time',
        validation: 'dateFormat',
      },
      {
        message: 'after validation failed on start_time',
        field: 'start_time',
        validation: 'after',
      },
      {
        message: 'dateFormat validation failed on end_time',
        field: 'end_time',
        validation: 'dateFormat',
      },
      {
        message: 'after validation failed on end_time',
        field: 'end_time',
        validation: 'after',
      },
    ],
  });
});
