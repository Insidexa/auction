'use strict';

const {
  test, afterEach,
} = use('Test/Suite')('Order Validation');
const { validateAll } = use('Validator');
const OrderUpdateValidator = use('App/Validators/OrderUpdate');
const { cleanUpDB } = require('../../utils/utils');

afterEach(async () => {
  await cleanUpDB();
});

test('POST orders.store (validate fails), 422', async ({ assert }) => {
  const orderValidator = new OrderUpdateValidator();
  const validation = await validateAll({
    arrival_type_id: 1,
  }, orderValidator.rules);

  assert.deepEqual([
    {
      message: 'required validation failed on arrival_location',
      field: 'arrival_location',
      validation: 'required',
    },
    {
      message: 'exists validation failed on arrival_type_id',
      field: 'arrival_type_id',
      validation: 'exists',
    },
  ], validation.messages());
});
