'use strict';

/* eslint-disable camelcase */

const {
  test, trait, before, after, afterEach,
} = use('Test/Suite')('Sign Up');
const Mail = use('Mail');
const Route = use('Route');
const Factory = use('Factory');
const User = use('App/Models/User');
const Token = use('App/Models/Token');
const userCustomData = require('../../../utils/userCustomData');

trait('Test/ApiClient');

before(async () => {
  Mail.fake();
});

after(async () => {
  Mail.restore();
});

afterEach(async () => {
  await Token.query().delete();
  await User.query().delete();
});

test('sign up check user in database', async ({ assert, client }) => {
  const user = await Factory.model('App/Models/User').make({
    birth_day: '1900-01-02',
  });
  const { email_confirmed, ...userRequest } = user.toJSON();
  const response = await client
    .post(Route.url('user.signup'))
    .send({
      password: userCustomData.password,
      password_confirmation: userCustomData.password,
      ...userRequest,
    })
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: userRequest,
  });

  const userDB = await User.findBy('email', userRequest.email);
  assert.isTrue(!!userDB);
});

test('sign up check send mail', async ({ client, assert }) => {
  const user = await Factory.model('App/Models/User').make({
    birth_day: '1900-01-02',
  });
  const { email_confirmed, ...userRequest } = user.toJSON();

  const response = await client
    .post(Route.url('user.signup'))
    .send({
      password: userCustomData.password,
      password_confirmation: userCustomData.password,
      ...userRequest,
    })
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: userRequest,
  });

  const userDB = await User.first();
  const token = await Token.query()
    .where('user_id', userDB.id)
    .where('type', Token.CONFIRMATION_TOKEN)
    .first();

  assert.isTrue(!!token);

  const recentEmail = Mail.pullRecent();

  assert.equal(recentEmail.message.to[0].address, userRequest.email);
});

test('confirmation token not found', async ({ client }) => {
  const confirmationToken = 'example token';

  const response = await client
    .post(Route.url('user.confirmation', { confirmationToken }))
    .end();

  response.assertStatus(404);
});

test('confirmation user', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create({
    email_confirmed: true,
  });

  const token = await Token.makeToken(user, Token.CONFIRMATION_TOKEN);

  const response = await client
    .post(Route.url('user.confirmation', { confirmationToken: token.token }))
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      email_confirmed: true,
    },
  });
});
