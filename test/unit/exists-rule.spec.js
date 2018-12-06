'use strict';

const { test } = use('Test/Suite')('Exists Rule');
const { validate } = use('Validator');

test('check not exists in db', async ({ assert }) => {
  const email = 'pedro@g.ci';
  const validation = await validate({ email }, {
    email: 'exists:users:email',
  });

  assert.isTrue(validation.fails());
  assert.deepEqual(validation.messages(), [
    {
      message: 'exists validation failed on email',
      field: 'email',
      validation: 'exists',
    },
  ]);
});
