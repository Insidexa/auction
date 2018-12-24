'use strict';

/* eslint-disable no-restricted-syntax */

const {
  test, trait, afterEach, beforeEach, after, before,
} = use('Test/Suite')('Bid');
const Route = use('Route');
const Factory = use('Factory');
const Event = use('Event');
const User = use('App/Models/User');
const Lot = use('App/Models/Lot');
const Moment = use('App/Utils/Moment');
const Queue = use('Kue/Queue');
const LotJobService = use('LotJobService');
const JobService = use('JobService');
const userCustomData = require('../../utils/userCustomData');
const {
  fakeMail, cleanUpDB, jobServiceTestMode, kueTestModeExtend, restoreKue, cleanUpLotRedisData,
} = require('../../utils/utils');

fakeMail();
let userAuth = null;
let lotProcess = null;
const lotEstimatedPrice = 1000;

trait('Test/ApiClient');
trait('Auth/Client');

before(async () => {
  Queue.testMode.enter();
  jobServiceTestMode(JobService);
  kueTestModeExtend(Queue);
});

after(async () => {
  restoreKue();
  Queue.testMode.exit();
});

beforeEach(async () => {
  const user = await Factory.model('App/Models/User').create({
    email: userCustomData.confirmedEmail,
    email_confirmed: true,
  });
  const userCustomer = await Factory.model('App/Models/User').create({
    email: 'other@g.com',
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
  Queue.testMode.clear();
  await cleanUpLotRedisData();
  await cleanUpDB();
});

test('POST bids.store (proposed price when first propose), 200', async ({ client }) => {
  Event.fake();

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

  Event.restore();
});

test('POST bids.store (check bids collection event), 200', async ({ client, assert }) => {
  Event.fake();

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

  const recent = Event.pullRecent();
  assert.equal(recent.event, 'lotPage::onCreateBid');

  Event.restore();
});

test('POST bids.store (not winner), 200', async ({ client }) => {
  Event.fake();

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

  Event.restore();
});

test('POST bids.store (winner check events), 200', async ({ client, assert }) => {
  Event.fake();

  await LotJobService.runJobs(lotProcess);

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

  await LotJobService.runJobs(lotProcess);

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
