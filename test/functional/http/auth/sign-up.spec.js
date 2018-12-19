'use strict';

/* eslint-disable camelcase */

const {
  test, trait, afterEach,
} = use('Test/Suite')('Sign Up');
const Mail = use('Mail');
const Route = use('Route');
const Factory = use('Factory');
const User = use('App/Models/User');
const Token = use('App/Models/Token');
const Moment = use('App/Utils/Moment');
const View = use('View');
const userCustomData = require('../../../utils/userCustomData');
const { fakeMail } = require('../../../utils/utils');

fakeMail();
trait('Test/ApiClient');

afterEach(async () => {
  await Token.query().delete();
  await User.query().delete();
});

const birthDay = Moment()
  .subtract(22, 'years')
  .format('YYYY-MM-DD');

test('sign up check user in database', async ({ assert, client }) => {
  const user = await Factory.model('App/Models/User').make({
    birth_day: birthDay,
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

test('sign up check send email', async ({ client, assert }) => {
  const user = await Factory.model('App/Models/User').make({
    birth_day: birthDay,
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
  assert.equal(recentEmail.message.html, View.render('emails.user-confirmation', { token }));
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
