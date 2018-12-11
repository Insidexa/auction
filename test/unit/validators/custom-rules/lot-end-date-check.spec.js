'use strict';

const { test } = use('Test/Suite')('Lot End Date Check');
const { validate } = use('Validator');

test('check lot end date', async ({ assert }) => {
  const validation = await validate({
    start_time: '2018-12-11 14:00:00',
    end_time: '2018-12-11 16:00:00',
  }, { end_time: 'lotCheckEndDate:start_time' });

  assert.isFalse(validation.fails());
});

test('check lot end date error', async ({ assert }) => {
  const validation = await validate({
    start_time: '2018-12-11 14:00:00',
    end_time: '2018-12-11 12:00:00',
  }, { end_time: 'lotCheckEndDate:start_time' });

  assert.isTrue(validation.fails());
  assert.deepEqual(validation.messages(), [
    {
      field: 'end_time',
      message: 'end_time must more start_time',
      validation: 'ENGINE_EXCEPTION',
    },
  ]);
});
