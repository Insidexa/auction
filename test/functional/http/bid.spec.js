'use strict';

/* eslint-disable no-restricted-syntax */

const {
  test, trait, afterEach, beforeEach,
} = use('Test/Suite')('Bid');
const Route = use('Route');
const Factory = use('Factory');
const Event = use('Event');
const User = use('App/Models/User');
const Lot = use('App/Models/Lot');
const Bid = use('App/Models/Bid');
const Order = use('App/Models/Order');
const Moment = use('App/Utils/Moment');
const userCustomData = require('../../utils/userCustomData');
const { fakeMail, cleanUpDB } = require('../../utils/utils');

fakeMail();
let userAuth = null;
let lotProcess = null;
const lotEstimatedPrice = 1000;

trait('Test/ApiClient');
trait('Auth/Client');


beforeEach(async () => {
  const user = await Factory.model('App/Models/User').create({
    email: userCustomData.confirmedEmail,
    password: userCustomData.password,
    email_confirmed: true,
  });
  const userCustomer = await Factory.model('App/Models/User').create({
    email: 'other@g.com',
    password: userCustomData.password,
    email_confirmed: true,
  });

  const startLotTime = Moment().subtract(1, 'hours').format();
  const endLotTime = Moment().add(1, 'hours').format();
  lotProcess = await Factory.model('App/Models/Lot').create({
    title: 'lot title',
    start_time: startLotTime,
    end_time: endLotTime,
    status: Lot.IN_PROCESS_STATUS,
    user_id: user.id,
    estimated_price: lotEstimatedPrice,
  });
  userAuth = await User.findBy('email', userCustomer.email);
});

afterEach(async () => {
  await cleanUpDB();
});

test('POST bids.store (lot not found), 404', async ({ client }) => {
  await Order.query().delete();
  await Bid.query().delete();
  await Lot.query().delete();
  const response = await client
    .post(Route.url('bids.store'))
    .send({
      lot_id: 1,
      proposed_price: 100,
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(404);
  response.assertJSONSubset({
    message: 'ModelNotFoundException',
  });
});

test('POST bids.store (cannot propose buy yourself lot), 403', async ({ client }) => {
  const selfUser = await User.findBy('email', userCustomData.confirmedEmail);
  const response = await client
    .post(Route.url('bids.store'))
    .send({
      lot_id: lotProcess.id,
      proposed_price: lotProcess.current_price / 2,
    })
    .loginVia(selfUser)
    .end();

  response.assertStatus(403);
  response.assertJSONSubset({
    message: 'CannotBuyYourselfLot',
  });
});

test('POST bids.store (proposed price less lot current price), 422', async ({ client }) => {
  await Factory.model('App/Models/Bid').create({
    proposed_price: 100,
    lot_id: lotProcess.id,
    user_id: userAuth.id,
  });
  const response = await client
    .post(Route.url('bids.store'))
    .send({
      lot_id: lotProcess.id,
      proposed_price: lotProcess.current_price / 2,
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(422);
  response.assertJSONSubset({
    message: 'BidPriceSmallerException',
  });
});

test('POST bids.store (proposed price less bids max price), 422', async ({ client }) => {
  await Factory.model('App/Models/Bid').create({
    proposed_price: 100,
    lot_id: lotProcess.id,
    user_id: userAuth.id,
  });
  const response = await client
    .post(Route.url('bids.store'))
    .send({
      lot_id: lotProcess.id,
      proposed_price: lotProcess.current_price + 10,
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(422);
  response.assertJSONSubset({
    message: 'BidPriceSmallerException',
  });
});

test('POST bids.store (proposed price when first propose), 200', async ({ client }) => {
  const proposedPrice = 100;
  const response = await client
    .post(Route.url('bids.store'))
    .send({
      lot_id: lotProcess.id,
      proposed_price: proposedPrice,
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      lot_id: lotProcess.id,
      user_id: userAuth.id,
      proposed_price: proposedPrice,
    },
  });
});

test('POST bids.store (not winner), 200', async ({ client }) => {
  const proposedPrice = 100;
  const response = await client
    .post(Route.url('bids.store'))
    .send({
      lot_id: lotProcess.id,
      proposed_price: proposedPrice,
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      isWinner: false,
      lot_id: lotProcess.id,
      user_id: userAuth.id,
      proposed_price: proposedPrice,
    },
  });
});

test('POST bids.store (winner check events), 200', async ({ client, assert }) => {
  Event.fake();

  const response = await client
    .post(Route.url('bids.store'))
    .send({
      lot_id: lotProcess.id,
      proposed_price: lotEstimatedPrice,
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      lot_id: lotProcess.id,
      user_id: userAuth.id,
      isWinner: true,
      proposed_price: lotEstimatedPrice,
    },
  });

  const events = Event.all();
  const orderOnWinnerEvent = events.find(event => event.event === 'order::onWinner');
  assert.isTrue(!!orderOnWinnerEvent);

  Event.restore();
});

test('POST bids.store (winner and lot closed), 200', async ({ client, assert }) => {
  Event.fake();

  const response = await client
    .post(Route.url('bids.store'))
    .send({
      lot_id: lotProcess.id,
      proposed_price: lotEstimatedPrice,
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      lot_id: lotProcess.id,
      user_id: userAuth.id,
      isWinner: true,
      proposed_price: lotEstimatedPrice,
    },
  });

  const closedLot = await Lot.find(lotProcess.id);
  assert.isTrue(closedLot.status === Lot.CLOSED_STATUS);

  Event.restore();
});
