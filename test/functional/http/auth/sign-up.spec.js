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
const { fakeMail, cleanUpDB } = require('../../../utils/utils');

fakeMail();
trait('Test/ApiClient');

afterEach(async () => {
  await cleanUpDB();
});

const birthDay = Moment()
  .subtract(22, 'years')
  .format('YYYY-MM-DD');

test('POST user.signup (check user in database), 200', async ({ assert, client }) => {
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

test('POST user.signup (check send email), 200', async ({ client, assert }) => {
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

test('POST user.confirmation (token not found), 404', async ({ client }) => {
  const confirmationToken = 'example token';

  const response = await client
    .post(Route.url('user.confirmation', { confirmationToken }))
    .end();

  response.assertStatus(404);
});

test('POST user.confirmation (user confirmed), 200', async ({ client }) => {
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
