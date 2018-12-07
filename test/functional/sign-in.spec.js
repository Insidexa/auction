'use strict';

const {
  test, trait, afterEach,
} = use('Test/Suite')('Sign In');
const Database = use('Database');
const Hash = use('Hash');

trait('Test/ApiClient');

afterEach(async () => {
  await Database
    .table('tokens')
    .delete();
  await Database
    .table('users')
    .delete();
});

test('sign in user not found', async ({ client }) => {
  const response = await client
    .post('api/signin')
    .send({
      email: 'email@g.com',
      password: 'password',
    })
    .end();

  response.assertStatus(400);
  response.assertJSONSubset({
    message: 'ValidationException',
  });
});

test('sign in user not confirmed', async ({ client }) => {
  const user = {
    email: 'example@g.com',
    password: 'password',
    phone: '12345678',
    first_name: 'Pedos',
    lastname: 'Zedros',
    birth_day: '1800-01-12',
  };
  await Database
    .insert(user)
    .into('users');

  const response = await client
    .post('api/signin')
    .send({
      email: 'example@g.com',
      password: 'password',
    })
    .end();

  response.assertStatus(401);
  response.assertJSON({
    message: 'AccountNotConfirmed',
    errors: [],
  });
});

test('password mismatch', async ({ client }) => {
  const user = {
    email: 'example@g.com',
    password: await Hash.make('password'),
    phone: '12345678',
    first_name: 'Pedos',
    lastname: 'Zedros',
    birth_day: '1800-01-12',
    email_confirmed: true,
  };
  await Database
    .insert(user)
    .into('users');

  const response = await client
    .post('api/signin')
    .send({
      email: 'example@g.com',
      password: 'password1',
    })
    .end();

  response.assertStatus(401);
  response.assertJSONSubset({
    message: 'PasswordMisMatchException',
  });
});

test('sign in successfully', async ({ client }) => {
  const user = {
    email: 'example@g.com',
    password: await Hash.make('password'),
    phone: '12345678',
    first_name: 'Pedos',
    lastname: 'Zedros',
    birth_day: '1800-01-12',
    email_confirmed: true,
  };

  await Database
    .insert(user)
    .into('users');

  const response = await client
    .post('api/signin')
    .send({
      email: 'example@g.com',
      password: 'password',
    })
    .end();
  response.assertStatus(200);
});
