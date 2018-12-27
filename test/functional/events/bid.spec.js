'use strict';

/* eslint-disable no-restricted-syntax */

const {
  test, trait, afterEach, beforeEach, before, after,
} = use('Test/Suite')('Bid events');
const Factory = use('Factory');
const Mail = use('Mail');
const View = use('View');
const Config = use('Config');
const Lot = use('App/Models/Lot');
const Moment = use('App/Utils/Moment');
const OrderListener = use('App/Listeners/OrderListener');
const Queue = use('Kue/Queue');
const LotJobService = use('LotJobService');
const JobService = use('JobService');
const userCustomData = require('../../utils/userCustomData');
const {
  fakeMail, cleanUpDB, jobServiceTestMode, kueTestModeExtend, restoreKue, cleanUpLotRedisData,
} = require('../../utils/utils');

fakeMail();
let user = null;
let lot = null;
const frontUrl = Config.get('app.frontUrl');
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
  user = await Factory.model('App/Models/User').create({
    email: userCustomData.confirmedEmail,
    email_confirmed: true,
  });

  const startLotTime = Moment().subtract(1, 'hours').format();
  const endLotTime = Moment().add(1, 'hours').format();
  lot = await Factory.model('App/Models/Lot').create({
    title: 'lot title',
    start_time: startLotTime,
    end_time: endLotTime,
    status: Lot.IN_PROCESS_STATUS,
    user_id: user.id,
    estimated_price: lotEstimatedPrice,
  });
  LotJobService.runJobs(lot);
});

afterEach(async () => {
  Queue.testMode.clear();
  await cleanUpLotRedisData();
  await cleanUpDB();
});

test('events order.onWinner (check email to winner)', async ({ assert }) => {
  const bid = await Factory.model('App/Models/Bid').create({
    proposed_price: 100,
    user_id: user.id,
    lot_id: lot.id,
  });

  const listener = new OrderListener();
  await listener.onWinner({ user, bid, lot });
  const winnerMail = Mail.all()[0];

  assert.equal(winnerMail.message.to[0].address, user.email);
  assert.equal(winnerMail.message.html, View.render('emails.bid-winner', {
    user,
    lot,
    bid,
    frontUrl,
  }));
});

test('events order.onWinner (check email to seller)', async ({ assert }) => {
  const bid = await Factory.model('App/Models/Bid').create({
    proposed_price: 100,
    user_id: user.id,
    lot_id: lot.id,
  });

  const listener = new OrderListener();
  await listener.onWinner({ user, bid, lot });
  const recent = Mail.pullRecent();

  assert.equal(recent.message.to[0].address, user.email);
  assert.equal(recent.message.html, View.render('emails.lot-closed', {
    user,
    lot,
    bid,
    frontUrl,
  }));
});
