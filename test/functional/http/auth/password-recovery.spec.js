'use strict';

const {
  test, trait, afterEach, beforeEach,
} = use('Test/Suite')('Password Recovery');
const Mail = use('Mail');
const Factory = use('Factory');
const Route = use('Route');
const View = use('View');
const Token = use('App/Models/Token');
const User = use('App/Models/User');
const userCustomData = require('../../../utils/userCustomData');
const { fakeMail, cleanUpDB } = require('../../../utils/utils');

fakeMail();

trait('Test/ApiClient');

beforeEach(async () => {
  await Factory.model('App/Models/User').create({
    email_confirmed: false,
    email: userCustomData.notConfirmedEmail,
  });

  await Factory.model('App/Models/User').create({
    email_confirmed: true,
    email: userCustomData.confirmedEmail,
  });
});

afterEach(async () => {
  await cleanUpDB();
});

test('POST user.passwordRecovery (email not confirmed), 401', async ({ client }) => {
  const response = await client
    .post(Route.url('user.passwordRecovery'))
    .send({ email: userCustomData.notConfirmedEmail })
    .end();

  response.assertStatus(401);
  response.assertJSONSubset({
    message: 'AccountNotConfirmed',
  });
});

test('POST user.passwordRecovery (check send email), 200', async ({ client, assert }) => {
  const email = userCustomData.confirmedEmail;

  const response = await client
    .post(Route.url('user.passwordRecovery'))
    .send({ email })
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({});

  const token = await Token.first();

  assert.isTrue(token.type === Token.PASSWORD_TOKEN);

  const recentEmail = Mail.pullRecent();
  assert.equal(recentEmail.message.to[0].address, email);
  assert.equal(recentEmail.message.html, View.render('emails.password-reset', { token }));
});

test('POST user.passwordUpdate (token not found), 404', async ({ client }) => {
  const recoveryToken = 'some token';

  const response = await client
    .post(Route.url('user.passwordUpdate', { recoveryToken }))
    .send({
      password: '12345678',
      password_confirmation: '12345678',
    })
    .end();

  response.assertStatus(404);
  response.assertJSONSubset({
    message: 'ModelNotFoundException',
  });
});

test('POST user.passwordUpdate (successfully), 200', async ({ client }) => {
  const email = userCustomData.confirmedEmail;
  const user = await User.findBy('email', email);
  const token = await Token.makeToken(user, Token.PASSWORD_TOKEN);

  const response = await client
    .post(Route.url('user.passwordUpdate', { recoveryToken: token.token }))
    .send({
      password: 'new password',
      password_confirmation: 'new password',
    })
    .end();

  response.assertStatus(200);
});
