'use strict';

const {
  test, trait, afterEach, beforeEach,
} = use('Test/Suite')('Sign In Validation');
const Route = use('Route');
const Mail = use('Mail');
const Factory = use('Factory');
const User = use('App/Models/User');

trait('Test/ApiClient');

beforeEach(async () => {
  Mail.fake();
  await Factory.model('App/Models/User').create();
});

afterEach(async () => {
  Mail.restore();
  await User.query().delete();
});

test('validate fails on sign in', async ({ client }) => {
  const response = await client
    .post(Route.url('user.signin'))
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
      {
        message: 'required validation failed on password',
        field: 'password',
        validation: 'required',
      },
    ],
  });
});

test('validate fails on sign in email exists', async ({ client }) => {
  const response = await client
    .post(Route.url('user.signin'))
    .send({
      email: 'notfound@g.ci',
      password: '12345678',
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
});
