'use strict';

const mockdate = require('mockdate');

const { test } = use('Test/Suite')('Lot Start Date Check');
const { validate } = use('Validator');

test('check lot start date', async ({ assert }) => {
  mockdate.set('2018-10-10');

  const validation = await validate({
    start_time: '2018-12-11 14:00:00',
  }, { start_time: 'lotCheckStartDate' });

  assert.isFalse(validation.fails());

  mockdate.reset();
});

test('check lot start date error', async ({ assert }) => {
  mockdate.set('2018-10-10');

  const validation = await validate({
    start_time: '2018-09-10 14:00:00',
  }, { start_time: 'lotCheckStartDate' });

  assert.isTrue(validation.fails());
  assert.deepEqual(validation.messages(), [
    {
      field: 'start_time',
      message: 'start_time must more current date',
      validation: 'ENGINE_EXCEPTION',
    },
  ]);

  mockdate.reset();
});
