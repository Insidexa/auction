'use strict';

const {
  test, trait, before, after,
} = use('Test/Suite')('Lot Validation');
const Route = use('Route');
const Factory = use('Factory');
const User = use('App/Models/User');
const userCustomData = require('../../utils/userCustomData');

trait('Test/ApiClient');
trait('Auth/Client');

before(async () => {
  await Factory.model('App/Models/User').create({
    email: userCustomData.confirmedEmail,
    password: userCustomData.password,
    email_confirmed: true,
  });
});

after(async () => {
  await User.query().delete();
});

test('validate fails on lot create', async ({ client }) => {
  const user = await User.findBy('email', userCustomData.confirmedEmail);
  const response = await client
    .post(Route.url('profile.lots.store'))
    .loginVia(user)
    .end();

  response.assertStatus(400);
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

test('validate fails on lot create custom rules', async ({ client }) => {
  const user = await User.findBy('email', userCustomData.confirmedEmail);
  const response = await client
    .post(Route.url('profile.lots.store'))
    .send({
      title: 'Lot title',
      current_price: 20.20,
      estimated_price: 100,
      start_time: '2018-10-10 12:00:00',
      end_time: '2018-10-10 10:00:00',
    })
    .loginVia(user)
    .end();

  response.assertStatus(400);
  response.assertJSON({
    message: 'ValidationException',
    description: [
      {
        message: 'start_time must more current date',
        field: 'start_time',
        validation: 'ENGINE_EXCEPTION',
      },
      {
        message: 'end_time must more start_time',
        field: 'end_time',
        validation: 'ENGINE_EXCEPTION',
      },
    ],
  });
});
