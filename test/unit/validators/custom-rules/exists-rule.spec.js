'use strict';

const {
  test, afterEach, beforeEach,
} = use('Test/Suite')('Exists Rule');
const Factory = use('Factory');
const { validate } = use('Validator');
const User = use('App/Models/User');
const { cleanUpDB } = require('../../../utils/utils');

let user = null;

beforeEach(async () => {
  user = await Factory.model('App/Models/User').create({
    email: 'email@.gco',
    email_confirmed: true,
  });
});

afterEach(async () => {
  await cleanUpDB();
});

test('validation exists-rule (custom)', async ({ assert }) => {
  const validation = await validate({
    user_id: user.id,
  }, {
    user_id: 'exists:users,id',
  });

  assert.isFalse(validation.fails());
});

test('validation exists-rule failed (custom)', async ({ assert }) => {
  await User.query().delete();
  const validation = await validate({
    user_id: 10,
  }, {
    user_id: 'exists:users,id',
  });

  assert.isTrue(validation.fails());
  assert.deepEqual(validation.messages(), [
    {
      field: 'user_id',
      message: 'exists validation failed on user_id',
      validation: 'exists',
    },
  ]);
});
