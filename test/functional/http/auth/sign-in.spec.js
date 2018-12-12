'use strict';

const {
  test, trait, afterEach, beforeEach,
} = use('Test/Suite')('Sign In');
const Route = use('Route');
const Factory = use('Factory');
const User = use('App/Models/User');
const Token = use('App/Models/Token');
const userCustomData = require('../../../utils/userCustomData');

trait('Test/ApiClient');

beforeEach(async () => {
  await Factory.model('App/Models/User').create({
    email_confirmed: false,
    password: userCustomData.password,
    email: userCustomData.notConfirmedEmail,
  });

  await Factory.model('App/Models/User').create({
    email_confirmed: true,
    password: userCustomData.password,
    email: userCustomData.confirmedEmail,
  });
});

afterEach(async () => {
  await Token.query().delete();
  await User.query().delete();
});

test('sign in user not found', async ({ client }) => {
  const response = await client
    .post(Route.url('user.signin'))
    .send({
      email: 'not_found_email@g.com',
      password: 'password',
    })
    .end();

  response.assertStatus(400);
  response.assertJSONSubset({
    message: 'ValidationException',
  });
});

test('sign in user not confirmed', async ({ client }) => {
  const { password, notConfirmedEmail } = userCustomData;

  const response = await client
    .post(Route.url('user.signin'))
    .send({
      email: notConfirmedEmail,
      password,
    })
    .end();

  response.assertStatus(401);
  response.assertJSONSubset({
    message: 'AccountNotConfirmed',
  });
});

test('password mismatch', async ({ client }) => {
  const email = userCustomData.confirmedEmail;

  const response = await client
    .post(Route.url('user.signin'))
    .send({
      email,
      password: 'password1',
    })
    .end();

  response.assertStatus(401);
  response.assertJSONSubset({
    message: 'PasswordMisMatchException',
  });
});

test('sign in successfully', async ({ client }) => {
  const { password, confirmedEmail } = userCustomData;

  const response = await client
    .post(Route.url('user.signin'))
    .send({
      email: confirmedEmail,
      password,
    })
    .end();

  response.assertStatus(200);
});
