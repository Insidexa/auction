'use strict';

const {
  test, trait, beforeEach, afterEach,
} = use('Test/Suite')('Password Recovery Validation');
const Route = use('Route');
const Factory = use('Factory');
const { cleanUpDB } = require('../../utils/utils');

beforeEach(async () => {
  await Factory.model('App/Models/User').create();
});

afterEach(async () => {
  await cleanUpDB();
});

trait('Test/ApiClient');

test('POST user.passwordRecovery (validate fails), 422', async ({ client }) => {
  const response = await client
    .post(Route.url('user.passwordRecovery'))
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
    ],
  });
});
