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
const Moment = use('App/Utils/Moment');
const userCustomData = require('../../utils/userCustomData');
const { fakeMail } = require('../../utils/utils');

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

  const startLotTime = Moment().subtract(1, 'hours');
  const endLotTime = Moment().add(1, 'hours');
  lotProcess = await Factory.model('App/Models/Lot').create({
    title: 'lot title',
    start_time: startLotTime,
    end_time: endLotTime,
    status: Lot.IN_PROCESS_STATUS,
    user_id: user.id,
    estimated_price: lotEstimatedPrice,
  });
  userAuth = await User.findBy('email', userCustomData.confirmedEmail);
});

afterEach(async () => {
  await Bid.query().delete();
  await Lot.query().delete();
  await User.query().delete();
});

test('bid creation lot not found', async ({ client }) => {
  await Bid.query().delete();
  await Lot.query().delete();
  const response = await client
    .post(Route.url('bids.store', { lotId: 1 }))
    .send({
      proposed_price: 100,
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(404);
  response.assertJSONSubset({
    message: 'ModelNotFoundException',
  });
});

test('bid proposed price less bids max price', async ({ client }) => {
  await Factory.model('App/Models/Bid').create({
    proposed_price: 100,
    lot_id: lotProcess.id,
    user_id: userAuth.id,
  });
  const response = await client
    .post(Route.url('bids.store', { lotId: lotProcess.id }))
    .send({
      proposed_price: 90,
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(400);
  response.assertJSONSubset({
    message: 'ProposedPriceMustGreater',
  });
});

test('bid proposed price when first propose', async ({ client }) => {
  const proposedPrice = 100;
  const response = await client
    .post(Route.url('bids.store', { lotId: lotProcess.id }))
    .send({
      proposed_price: proposedPrice,
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      bid: {
        proposed_price: proposedPrice,
      },
    },
  });
});

test('bid not winner', async ({ client }) => {
  const proposedPrice = 100;
  const response = await client
    .post(Route.url('bids.store', { lotId: lotProcess.id }))
    .send({
      proposed_price: proposedPrice,
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      isWinner: false,
      bid: {
        proposed_price: proposedPrice,
      },
    },
  });
});

test('bid winner check events', async ({ client, assert }) => {
  Event.fake();

  const response = await client
    .post(Route.url('bids.store', { lotId: lotProcess.id }))
    .send({
      proposed_price: lotEstimatedPrice,
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      isWinner: true,
      bid: {
        proposed_price: lotEstimatedPrice,
      },
    },
  });

  const events = Event.all();
  const bidEvent = events.find(event => event.event === 'bid::onWinner');
  const lotBidWinnerEvent = events.find(event => event.event === 'lot::onBidWinner');
  assert.isTrue(!!bidEvent);
  assert.isTrue(!!lotBidWinnerEvent);

  Event.restore();
});

test('bid winner and lot closed', async ({ client, assert }) => {
  Event.fake();

  const response = await client
    .post(Route.url('bids.store', { lotId: lotProcess.id }))
    .send({
      proposed_price: lotEstimatedPrice,
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      isWinner: true,
      bid: {
        proposed_price: lotEstimatedPrice,
      },
    },
  });

  const closedLot = await Lot.find(lotProcess.id);
  assert.isTrue(closedLot.status === Lot.CLOSED_STATUS);

  Event.restore();
});
