'use strict';

const {
  test, trait, beforeEach, afterEach,
} = use('Test/Suite')('Password Recovery Validation');
const Route = use('Route');
const Mail = use('Mail');
const Factory = use('Factory');
const User = use('App/Models/User');

beforeEach(async () => {
  await Factory.model('App/Models/User').create();
});

afterEach(async () => {
  await User.query().delete();
});

trait('Test/ApiClient');

test('validate fails on password recovery required', async ({ client }) => {
  const response = await client
    .post(Route.url('user.passwordRecovery'))
    .end();

  response.assertStatus(400);
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

test('validate fails on password recovery email exists', async ({ client }) => {
  Mail.fake();

  const response = await client
    .post(Route.url('user.passwordRecovery'))
    .send({
      email: 'not-found@g.co',
    })
    .end();

  response.assertStatus(400);
  response.assertJSON({
    message: 'ValidationException',
    description: [
      {
        message: 'exists validation failed on email',
        field: 'email',
        validation: 'exists',
      },
    ],
  });

  Mail.restore();
});
