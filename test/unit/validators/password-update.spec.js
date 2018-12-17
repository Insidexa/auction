'use strict';

const { test, trait } = use('Test/Suite')('Password Update Validation');
const Route = use('Route');

trait('Test/ApiClient');

test('validate fails on password update', async ({ client }) => {
  const response = await client
    .post(Route.url('user.passwordUpdate', { recoveryToken: 'sometoken' }))
    .end();

  response.assertStatus(422);
  response.assertJSON({
    message: 'ValidationException',
    description: [
      {
        message: 'required validation failed on password',
        field: 'password',
        validation: 'required',
      },
    ],
  });
});

test('validate fails on password update confirmation', async ({ client }) => {
  const response = await client
    .post(Route.url('user.passwordUpdate', { recoveryToken: 'sometoken' }))
    .send({
      password: '12345678',
      password_confirmation: '123456789',
    })
    .end();

  response.assertStatus(422);
  response.assertJSON({
    message: 'ValidationException',
    description: [
      {
        message: 'confirmed validation failed on password',
        field: 'password',
        validation: 'confirmed',
      },
    ],
  });
});
