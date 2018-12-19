'use strict';

const {
  test, trait, afterEach, beforeEach,
} = use('Test/Suite')('Sign In');
const Route = use('Route');
const Factory = use('Factory');
const User = use('App/Models/User');
const userCustomData = require('../../../utils/userCustomData');
const { cleanUpDB } = require('../../../utils/utils');

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
  await cleanUpDB();
});

test('POST user.signin (user not found), 404', async ({ client }) => {
  const response = await client
    .post(Route.url('user.signin'))
    .send({
      email: 'not_found_email@g.com',
      password: 'password',
    })
    .end();

  response.assertStatus(404);
  response.assertJSONSubset({
    message: 'ModelNotFoundException',
  });
});

test('POST user.signin (user not confirmed), 401', async ({ client }) => {
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

test('POST user.signin (successfully), 200', async ({ client }) => {
  const { password, confirmedEmail } = userCustomData;
  const user = await User.findBy({ email: confirmedEmail });

  const response = await client
    .post(Route.url('user.signin'))
    .send({
      email: confirmedEmail,
      password,
    })
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: user.toJSON(),
  });
});
