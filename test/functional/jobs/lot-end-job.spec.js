'use strict';

/* eslint-disable no-restricted-syntax */

const {
  test, trait, afterEach, beforeEach, before, after,
} = use('Test/Suite')('LotEndJob');
const Factory = use('Factory');
const Event = use('Event');
const Lot = use('App/Models/Lot');
const Bid = use('App/Models/Bid');
const Order = use('App/Models/Order');
const Moment = use('App/Utils/Moment');
const LotEndJob = use('App/Jobs/LotEndJob');
const Queue = use('Kue/Queue');
const LotJobService = use('LotJobService');
const JobService = use('JobService');
const userCustomData = require('../../utils/userCustomData');
const {
  cleanUpDB, jobServiceTestMode, kueTestModeExtend, restoreKue, cleanUpLotRedisData,
} = require('../../utils/utils');


const lotEstimatedPrice = 1000;
let user = null;
let lotInProcess = null;
let bidMaxProposedPrice = null;

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
  user = await Factory.model('App/Models/User').create({
    email: userCustomData.confirmedEmail,
    email_confirmed: true,
  });

  const startLotTime = Moment().subtract(1, 'hours').format();
  const endLotTime = Moment().add(1, 'hours').format();
  lotInProcess = await Factory.model('App/Models/Lot').create({
    title: 'lot title',
    start_time: startLotTime,
    end_time: endLotTime,
    status: Lot.IN_PROCESS_STATUS,
    user_id: user.id,
    estimated_price: lotEstimatedPrice,
  });
  bidMaxProposedPrice = await Factory.model('App/Models/Bid').create({
    proposed_price: lotEstimatedPrice,
    user_id: user.id,
    lot_id: lotInProcess.id,
  });
  await Factory.model('App/Models/Bid').create({
    proposed_price: lotEstimatedPrice / 2,
    user_id: user.id,
    lot_id: lotInProcess.id,
  });
});

afterEach(async () => {
  await cleanUpDB();
  await cleanUpLotRedisData();
});

test('jobs LotEndJob (lot closed and zero winners)', async ({ assert }) => {
  await Bid.query().delete();
  const job = new LotEndJob();

  await job.handle({
    data: {
      id: lotInProcess.id,
    },
  }, () => {});

  const lot = await Lot.find(lotInProcess.id);
  const order = await lot.order().fetch();

  assert.equal(lot.status, Lot.CLOSED_STATUS);
  assert.equal(order, null);
});

test('jobs LotEndJob (check order event)', async ({ assert }) => {
  Event.fake();

  await LotJobService.runJobs(lotInProcess);

  const job = new LotEndJob();

  await new Promise((resolve) => {
    job.handle({
      data: {
        id: lotInProcess.id,
      },
    }, resolve);
  });

  const lot = await Lot.find(lotInProcess.id);
  const recent = Event.pullRecent();

  assert.equal(recent.event, 'order::onWinner');
  assert.equal(lot.status, Lot.CLOSED_STATUS);

  Event.restore();
});

test('jobs LotEndJob (check lot order in db)', async ({ assert }) => {
  Event.fake();

  await LotJobService.runJobs(lotInProcess);

  const job = new LotEndJob();

  await job.handle({
    data: {
      id: lotInProcess.id,
    },
  }, () => {});

  const lot = await Lot.query()
    .where('id', lotInProcess.id)
    .with('order')
    .first();
  const lotJSON = lot.toJSON();

  assert.include(lotJSON.order, {
    user_id: user.id,
    lot_id: lotInProcess.id,
    bid_id: bidMaxProposedPrice.id,
    status: Order.PENDING_STATUS,
  });
  assert.equal(lot.status, Lot.CLOSED_STATUS);

  Event.restore();
});
