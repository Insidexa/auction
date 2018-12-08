'use strict';

const {
  test, trait, beforeEach, afterEach,
} = use('Test/Suite')('Sign Up Validation');
const Route = use('Route');
const Mail = use('Mail');
const Factory = use('Factory');
const User = use('App/Models/User');
const userCustomData = require('../../userCustomData');

trait('Test/ApiClient');

beforeEach(async () => {
  Mail.fake();
  await Factory.model('App/Models/User').create({
    email: userCustomData.confirmedEmail,
    phone: '77777777777',
  });
});

afterEach(async () => {
  Mail.restore();
  await User.query().delete();
});

trait('Test/ApiClient');

test('validate fails on sign up', async ({ client }) => {
  const response = await client
    .post(Route.url('user.signup'))
    .end();

  response.assertStatus(400);
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

test('validate fails on sign up custom', async ({ client }) => {
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

  response.assertStatus(400);
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
        message: 'ageCheck validation failed on birth_day. Must be more than 21',
        field: 'birth_day',
        validation: 'ENGINE_EXCEPTION',
      },
    ],
  });
});
