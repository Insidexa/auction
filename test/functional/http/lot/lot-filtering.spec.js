'use strict';

/* eslint-disable no-restricted-syntax */

const {
  test, trait, beforeEach, afterEach,
} = use('Test/Suite')('Lot Filtering');
const Route = use('Route');
const Factory = use('Factory');
const User = use('App/Models/User');
const Lot = use('App/Models/Lot');
const Moment = use('App/Utils/Moment');
const userCustomData = require('../../../utils/userCustomData');
const { cleanUpDB } = require('../../../utils/utils');

trait('Test/ApiClient');
trait('Auth/Client');

const title = 'lot-title';
const prices = [300, 200, 100];
let lotForTests = null;
let userAuth = null;
let otherUser = null;
let otherLot = null;
const startLotTime = Moment().subtract(1, 'hours').format();
const endLotTime = Moment().add(1, 'hours').format();

afterEach(async () => {
  await cleanUpDB();
});

beforeEach(async () => {
  const user = await Factory.model('App/Models/User').create({
    email: userCustomData.confirmedEmail,
    email_confirmed: true,
  });
  otherUser = await Factory.model('App/Models/User').create({
    email: 'other@g.ci',
    email_confirmed: true,
  });
  otherLot = await Factory.model('App/Models/Lot').create({
    title: 'lot title',
    start_time: startLotTime,
    end_time: endLotTime,
    status: Lot.IN_PROCESS_STATUS,
    user_id: otherUser.id,
    estimated_price: 1000,
  });
  lotForTests = await Factory.model('App/Models/Lot').create({
    title,
    start_time: startLotTime,
    end_time: endLotTime,
    status: Lot.PENDING_STATUS,
    user_id: user.id,
  });
  for (const price of prices) {
    await Factory.model('App/Models/Bid').create({
      user_id: user.id,
      lot_id: lotForTests.id,
      proposed_price: price,
    });
  }
  await Factory.model('App/Models/Bid').create({
    user_id: user.id,
    lot_id: otherLot.id,
    proposed_price: 900,
  });
  userAuth = await User.findBy('email', userCustomData.confirmedEmail);
});

test('GET lots.all (filter only process status), 200', async ({ client }) => {
  lotForTests.status = Lot.IN_PROCESS_STATUS;
  await lotForTests.save();

  const response = await client
    .get(Route.url('lots.all'))
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: [
      {
        status: Lot.IN_PROCESS_STATUS,
      },
    ],
  });
});

test('GET lots.all (filter process status), 200', async ({ client }) => {
  lotForTests.status = Lot.IN_PROCESS_STATUS;
  await lotForTests.save();

  const perPage = 11;
  const page = 1;
  const response = await client
    .get(Route.url('lots.all'))
    .send({
      perPage,
      page,
    })
    .loginVia(userAuth)
    .end();

  response.assertJSONSubset({
    data: [
      {
        title: lotForTests.title,
      },
    ],
  });
});

test('GET lots.all (pagination check remain), 200', async ({ client }) => {
  const total = 35;
  const lastLotsIds = [];
  for (let i = 0; i < total; i++) {
    const lot = await Factory.model('App/Models/Lot').create({
      status: Lot.IN_PROCESS_STATUS,
      user_id: userAuth.id,
      start_time: startLotTime,
      end_time: endLotTime,
    });
    if (i > 30) {
      lastLotsIds.push({ id: lot.id });
    }
  }

  const perPage = 10;
  const page = 4;
  const response = await client
    .get(Route.url('lots.all'))
    .send({
      perPage,
      page,
    })
    .loginVia(userAuth)
    .end();

  response.assertJSONSubset({
    data: lastLotsIds,
    meta: {
      total: (total + 1).toString(),
      lastPage: page,
      page,
      perPage,
    },
  });
});

test('GET lots.self (filter self created lots), 200', async ({ client }) => {
  const perPage = 11;
  const page = 1;
  const response = await client
    .get(Route.url('lots.self'))
    .send({
      perPage,
      page,
    })
    .loginVia(userAuth)
    .end();

  response.assertJSONSubset({
    data: [
      {
        title: lotForTests.title,
      },
    ],
  });
});

test('GET lots.self (pagination negative params), 500', async ({ client }) => {
  const perPage = -10;
  const page = -1;
  const response = await client
    .get(Route.url('lots.self'))
    .loginVia(userAuth)
    .send({
      type: 'created',
      perPage,
      page,
    })
    .end();

  response.assertStatus(500);
  response.assertJSONSubset({
    message: 'error',
  });
});

test('GET lots.self (filtering participation), 200', async ({ client }) => {
  lotForTests.status = Lot.IN_PROCESS_STATUS;
  await lotForTests.save();

  const perPage = 10;
  const page = 1;
  const response = await client
    .get(Route.url('lots.self'))
    .send({
      perPage,
      page,
      type: 'participation',
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: [
      { id: otherLot.id, user_id: otherUser.id },
    ],
    meta: {
      total: '1',
      perPage,
      page,
    },
  });
});

test('GET lots.self (filter by type created), 200', async ({ client }) => {
  const anotherUser = await User.findBy('email', 'other@g.ci');

  await Factory.model('App/Models/Lot').create({
    title: 'Lotimg',
    start_time: startLotTime,
    end_time: endLotTime,
    status: Lot.CLOSED_STATUS,
    user_id: anotherUser.id,
  });

  const response = await client
    .get(Route.url('lots.self'))
    .loginVia(userAuth)
    .send({
      type: 'all',
    })
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: [
      {
        user_id: userAuth.id,
      },
    ],
  });
});

test('GET lots.self (filtering all), 200', async ({ client }) => {
  const lot = await Factory.model('App/Models/Lot').create({
    start_time: startLotTime,
    end_time: endLotTime,
    status: Lot.PENDING_STATUS,
    user_id: userAuth.id,
  });

  const perPage = 10;
  const page = 1;
  const response = await client
    .get(Route.url('lots.self'))
    .send({
      perPage,
      page,
      type: 'all',
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: [
      { id: otherLot.id, user_id: otherUser.id },
      { id: lotForTests.id, user_id: userAuth.id },
      { id: lot.id, user_id: userAuth.id },
    ],
    meta: {
      total: '3',
      perPage,
      page,
    },
  });
});

test('GET lots.show (with sorted bids), 200', async ({ client }) => {
  const response = await client
    .get(Route.url('lots.show', { id: lotForTests.id }))
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      bids: prices.map(price => ({ proposed_price: price })),
    },
  });
});
