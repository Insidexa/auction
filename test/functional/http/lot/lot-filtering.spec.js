'use strict';

/* eslint-disable no-restricted-syntax */

const {
  test, trait, beforeEach, afterEach,
} = use('Test/Suite')('Lot Filtering');
const Route = use('Route');
const Factory = use('Factory');
const User = use('App/Models/User');
const Lot = use('App/Models/Lot');
const Bid = use('App/Models/Bid');
const userCustomData = require('../../../utils/userCustomData');

trait('Test/ApiClient');
trait('Auth/Client');

const title = 'lot-title';
const prices = [300, 200, 100];
let lotForTests = null;
let userAuth = null;
let otherUser = null;
let otherLot = null;

afterEach(async () => {
  await Bid.query().delete();
  await Lot.query().delete();
  await User.query().delete();
});

beforeEach(async () => {
  const user = await Factory.model('App/Models/User').create({
    email: userCustomData.confirmedEmail,
    password: userCustomData.password,
    email_confirmed: true,
  });
  otherUser = await Factory.model('App/Models/User').create({
    email: 'other@g.ci',
    password: userCustomData.password,
    email_confirmed: true,
  });
  otherLot = await Factory.model('App/Models/Lot').create({
    title: 'lot title',
    start_time: '2018-12-12 10:00:00',
    end_time: '2018-12-13 10:00:00',
    status: Lot.IN_PROCESS_STATUS,
    user_id: otherUser.id,
    estimated_price: 1000,
  });
  lotForTests = await Factory.model('App/Models/Lot').create({
    title,
    start_time: '2018-12-12 10:00:00',
    end_time: '2018-12-13 10:00:00',
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

test('lot filter only process status ', async ({ client }) => {
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

test('lot self type created ', async ({ client }) => {
  const anotherUser = await User.findBy('email', 'other@g.ci');

  await Factory.model('App/Models/Lot').create({
    title: 'Lotimg',
    start_time: '2018-12-12 10:00:00',
    end_time: '2018-12-13 10:00:00',
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

test('lot pagination filter process status', async ({ client }) => {
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

test('lot pagination filter self created lots', async ({ client }) => {
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

test('lot pagination check remain', async ({ client }) => {
  const total = 35;
  const lastLotsIds = [];
  for (let i = 0; i < total; i++) {
    const lot = await Factory.model('App/Models/Lot').create({
      status: Lot.IN_PROCESS_STATUS,
      user_id: userAuth.id,
      start_time: '2018-10-10 10:00:00',
      end_time: '2018-10-10 11:00:00',
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

test('lot pagination negative params', async ({ client }) => {
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


test('my lots filtering participation', async ({ client }) => {
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

test('test my lots filtering all', async ({ client }) => {
  const lot = await Factory.model('App/Models/Lot').create({
    start_time: '2018-12-12 10:00:00',
    end_time: '2018-12-13 10:00:00',
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

test('lot show with sorted bids', async ({ client }) => {
  const response = await client
    .get(Route.url('lots.page', { id: lotForTests.id }))
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      bids: prices.map(price => ({ proposed_price: price })),
    },
  });
});

test('lot show with check no create order', async ({ client }) => {
  const response = await client
    .get(Route.url('lots.page', { id: lotForTests.id }))
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      canCheckout: false,
    },
  });
});

test('lot show can create order', async ({ client }) => {
  const bid = await Factory.model('App/Models/Bid').create({
    user_id: userAuth.id,
    lot_id: lotForTests.id,
    proposed_price: lotForTests.estimated_price,
  });

  lotForTests.winner_data = {
    user_id: userAuth.id,
    bid_id: bid.id,
  };
  lotForTests.status = Lot.CLOSED_STATUS;
  await lotForTests.save();
  const response = await client
    .get(Route.url('lots.page', { id: lotForTests.id }))
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      canCheckout: true,
    },
  });
});
