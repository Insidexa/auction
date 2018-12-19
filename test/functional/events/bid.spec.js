'use strict';

/* eslint-disable no-restricted-syntax */

const {
  test, trait, afterEach, beforeEach,
} = use('Test/Suite')('Bid events');
const Factory = use('Factory');
const Mail = use('Mail');
const View = use('View');
const User = use('App/Models/User');
const Lot = use('App/Models/Lot');
const Bid = use('App/Models/Bid');
const Moment = use('App/Utils/Moment');
const BidListener = use('App/Listeners/BidListener');
const LotListener = use('App/Listeners/LotListener');
const userCustomData = require('../../utils/userCustomData');
const { fakeMail } = require('../../utils/utils');

fakeMail();
let user = null;
let lot = null;
const lotEstimatedPrice = 1000;

trait('Test/ApiClient');
trait('Auth/Client');


beforeEach(async () => {
  user = await Factory.model('App/Models/User').create({
    email: userCustomData.confirmedEmail,
    password: userCustomData.password,
    email_confirmed: true,
  });

  const startLotTime = Moment().subtract(1, 'hours');
  const endLotTime = Moment().add(1, 'hours');
  lot = await Factory.model('App/Models/Lot').create({
    title: 'lot title',
    start_time: startLotTime,
    end_time: endLotTime,
    status: Lot.IN_PROCESS_STATUS,
    user_id: user.id,
    estimated_price: lotEstimatedPrice,
  });
});

afterEach(async () => {
  await Bid.query().delete();
  await Lot.query().delete();
  await User.query().delete();
});

test('bid listener -> onWinner', async ({ assert }) => {
  const bid = await Factory.model('App/Models/Bid').create({
    proposed_price: 100,
    user_id: user.id,
    lot_id: lot.id,
  });

  const listener = new BidListener();
  await listener.onWinner({ bid, lot });

  const recent = Mail.pullRecent();

  assert.equal(recent.message.to[0].address, user.email);
  assert.equal(recent.message.html, View.render('emails.bid-winner', {
    user,
    lot,
    bid,
  }));
});

test('lot listener -> onBidWinner', async ({ assert }) => {
  const bid = await Factory.model('App/Models/Bid').create({
    proposed_price: 100,
    user_id: user.id,
    lot_id: lot.id,
  });

  const listener = new LotListener();
  await listener.onBidWinner({ bid, lot });

  const recent = Mail.pullRecent();

  assert.equal(recent.message.to[0].address, user.email);
  assert.equal(recent.message.html, View.render('emails.lot-closed', {
    user,
    lot,
    bid,
  }));
});
