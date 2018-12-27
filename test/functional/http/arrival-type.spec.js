'use strict';

/* eslint-disable no-restricted-syntax */

const {
  test, trait, before, after,
} = use('Test/Suite')('Arrival Type');
const Route = use('Route');
const Factory = use('Factory');
const ArrivalType = use('App/Models/ArrivalType');
const { createTestArrivalType, cleanUpDB } = require('../../utils/utils');
const userCustomData = require('../../utils/userCustomData');

let user = null;

before(async () => {
  await createTestArrivalType();
  user = await Factory.model('App/Models/User').create({
    email: userCustomData.confirmedEmail,
    email_confirmed: true,
  });
});

after(async () => {
  await cleanUpDB();
});

trait('Test/ApiClient');
trait('Auth/Client');

test('GET arrival-types.index (list), 200', async ({ client }) => {
  const arrivalTypes = await ArrivalType.all();
  const response = await client
    .get(Route.url('arrival-types.index'))
    .loginVia(user)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: arrivalTypes.toJSON().map(({ id, name }) => ({ id, name })),
  });
});
