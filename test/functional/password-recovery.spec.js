'use strict';

const uuidv4 = require('uuid/v4');

const {
  test, trait, afterEach,
} = use('Test/Suite')('Password Recovery');
const Mail = use('Mail');
const Database = use('Database');
const Token = use('App/Models/Token');

const user = {
  first_name: 'Pedos',
  lastname: 'Zedros',
  birth_day: '1800-01-12',
  password: '12345678',
};

trait('Test/ApiClient');

afterEach(async () => {
  await Database
    .table('tokens')
    .delete();
  await Database
    .table('users')
    .delete();
});

test('password recovery email not confirmed', async ({ client }) => {
  const filledUser = {
    ...user,
    phone: '234234444444',
    email: 'huan@g.ci',
  };
  await Database
    .table('users')
    .insert(filledUser);

  const response = await client
    .post('api/password/recovery')
    .send({ email: filledUser.email })
    .end();

  response.assertStatus(401);
  response.assertJSONSubset({
    message: 'AccountNotConfirmed',
  });
});

test('password recovery send email', async ({ client, assert }) => {
  Mail.fake();

  const filledUser = {
    ...user,
    phone: '234232444444',
    email: 'huan1@g.ci',
    email_confirmed: true,
  };
  await Database
    .table('users')
    .insert(filledUser);

  const response = await client
    .post('api/password/recovery')
    .send({ email: filledUser.email })
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: null,
  });

  const token = await Token.first();

  assert.isTrue(token.type === Token.PASSWORD_TOKEN);

  const recentEmail = Mail.pullRecent();

  assert.equal(recentEmail.message.to[0].address, filledUser.email);

  Mail.restore();
});

test('password update token not found', async ({ client }) => {
  const token = 'some token';

  const response = await client
    .post(`api/password/update/${token}`)
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

test('password update successfully', async ({ client }) => {
  const filledUser = {
    ...user,
    phone: '234234444444',
    email: 'huan@g.ci',
  };
  const [userId] = await Database
    .insert(filledUser)
    .into('users')
    .returning('id'); // for postgres only: https://adonisjs.com/docs/4.0/query-builder#_postgresql_only

  const token = {
    token: uuidv4(),
    type: Token.PASSWORD_TOKEN,
    user_id: userId,
  };
  await Database
    .table('tokens')
    .insert(token);

  const response = await client
    .post(`/api/password/update/${token.token}`)
    .send({
      password: 'new password',
      password_confirmation: 'new password',
    })
    .end();

  response.assertStatus(200);
});
