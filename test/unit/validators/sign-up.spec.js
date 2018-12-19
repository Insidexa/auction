'use strict';

const {
  test, trait, beforeEach, afterEach,
} = use('Test/Suite')('Sign Up Validation');
const Route = use('Route');
const Factory = use('Factory');
const userCustomData = require('../../utils/userCustomData');
const { fakeMail, cleanUpDB } = require('../../utils/utils');

fakeMail();
trait('Test/ApiClient');

beforeEach(async () => {
  await Factory.model('App/Models/User').create({
    email: userCustomData.confirmedEmail,
    phone: '77777777777',
  });
});

afterEach(async () => {
  await cleanUpDB();
});

test('POST user.signup (validate fails), 422', async ({ client }) => {
  const response = await client
    .post(Route.url('user.signup'))
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
      {
        message: 'required validation failed on email',
        field: 'email',
        validation: 'required',
      },
      {
        message: 'required validation failed on phone',
        field: 'phone',
        validation: 'required',
      },
      {
        message: 'required validation failed on first_name',
        field: 'first_name',
        validation: 'required',
      },
      {
        message: 'required validation failed on lastname',
        field: 'lastname',
        validation: 'required',
      },
      {
        message: 'required validation failed on birth_day',
        field: 'birth_day',
        validation: 'required',
      },
    ],
  });
});

test('POST user.signup (validate fails custom rules), 422', async ({ client }) => {
  const response = await client
    .post(Route.url('user.signup'))
    .send({
      password: '12345678',
      password_confirmation: '123456789',
      email: userCustomData.confirmedEmail,
      first_name: 'Pedros',
      lastname: 'Zedros',
      birth_day: '2001-10-10',
      phone: '77777777777',
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
      {
        message: 'unique validation failed on email',
        field: 'email',
        validation: 'unique',
      },
      {
        message: 'unique validation failed on phone',
        field: 'phone',
        validation: 'unique',
      },
      {
        message: 'before validation failed on birth_day',
        field: 'birth_day',
        validation: 'before',
      },
    ],
  });
});
