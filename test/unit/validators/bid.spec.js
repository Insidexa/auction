'use strict';

const {
  test, trait, afterEach, beforeEach,
} = use('Test/Suite')('Bid Validation');
const Route = use('Route');
const Factory = use('Factory');
const User = use('App/Models/User');
const userCustomData = require('../../utils/userCustomData');
const { cleanUpDB } = require('../../utils/utils');

trait('Test/ApiClient');
trait('Auth/Client');

beforeEach(async () => {
  await Factory.model('App/Models/User').create({
    email: userCustomData.confirmedEmail,
    password: userCustomData.password,
    email_confirmed: true,
  });
});

afterEach(async () => {
  await cleanUpDB();
});

test('POST bids.store (validate fails), 422', async ({ client }) => {
  const user = await User.findBy('email', userCustomData.confirmedEmail);
  const response = await client
    .post(Route.url('bids.store'))
    .send({
      lot_id: 1,
      proposed_price: -1,
    })
    .loginVia(user)
    .end();

  response.assertStatus(422);
  response.assertJSON({
    message: 'ValidationException',
    description: [
      {
        message: 'above validation failed on proposed_price',
        field: 'proposed_price',
        validation: 'above',
      },
    ],
  });
});
