'use strict';

const {
  test, trait, afterEach, beforeEach,
} = use('Test/Suite')('Sign In Validation');
const Route = use('Route');
const Factory = use('Factory');
const { fakeMail, cleanUpDB } = require('../../utils/utils');

fakeMail();
trait('Test/ApiClient');

beforeEach(async () => {
  await Factory.model('App/Models/User').create();
});

afterEach(async () => {
  await cleanUpDB();
});

test('POST user.signin (validate fails), 422', async ({ client }) => {
  const response = await client
    .post(Route.url('user.signin'))
    .end();

  response.assertStatus(422);
  response.assertJSON({
    message: 'ValidationException',
    description: [
      {
        message: 'required validation failed on email',
        field: 'email',
        validation: 'required',
      },
      {
        message: 'required validation failed on password',
        field: 'password',
        validation: 'required',
      },
    ],
  });
});
