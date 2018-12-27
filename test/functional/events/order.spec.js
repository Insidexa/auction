'use strict';

/* eslint-disable no-restricted-syntax */

const {
  test, trait, afterEach, beforeEach,
} = use('Test/Suite')('Order events');
const Factory = use('Factory');
const Mail = use('Mail');
const View = use('View');
const Config = use('Config');
const Lot = use('App/Models/Lot');
const Moment = use('App/Utils/Moment');
const OrderListener = use('App/Listeners/OrderListener');
const userCustomData = require('../../utils/userCustomData');
const { fakeMail, cleanUpDB, findMailByEmail } = require('../../utils/utils');

fakeMail();

let userSeller = null;
let userCustomer = null;
let lot = null;
let order = null;
const frontUrl = Config.get('app.frontUrl');

trait('Test/ApiClient');
trait('Auth/Client');

beforeEach(async () => {
  userSeller = await Factory.model('App/Models/User').create({
    email: userCustomData.confirmedEmail,
    email_confirmed: true,
  });
  userCustomer = await Factory.model('App/Models/User').create({
    email: 'other@g.com',
    email_confirmed: true,
  });

  const startLotTime = Moment().subtract(1, 'hours').format();
  const endLotTime = Moment().add(1, 'hours').format();
  lot = await Factory.model('App/Models/Lot').create({
    title: 'lot title',
    start_time: startLotTime,
    end_time: endLotTime,
    status: Lot.CLOSED_STATUS,
    user_id: userSeller.id,
  });
  const bid = await Factory.model('App/Models/Bid').create({
    user_id: userCustomer.id,
    lot_id: lot.id,
    proposed_price: lot.estimated_price,
  });
  order = await Factory.model('App/Models/Order').create({
    user_id: userCustomer.id,
    bid_id: bid.id,
    lot_id: lot.id,
  });
});

afterEach(async () => {
  await cleanUpDB();
  Mail.clear();
});

test('events order.onCreate (email to seller)', async ({ assert }) => {
  const listener = new OrderListener();
  await listener.onCreate({ order, lot });
  const recentEmail = Mail.pullRecent();

  assert.equal(recentEmail.message.to[0].address, userSeller.email);
  assert.equal(recentEmail.message.html, View.render('emails.order.created', {
    frontUrl,
    user: userSeller,
    lot,
  }));
});

test('events order.onSellerExecute (email to customer)', async ({ assert }) => {
  const listener = new OrderListener();
  await listener.onSellerExecute({ order, lot });
  const recent = Mail.pullRecent();

  assert.equal(recent.message.to[0].address, userCustomer.email);
  assert.equal(recent.message.html, View.render('emails.order.executed', {
    user: userCustomer,
    lot,
    frontUrl,
  }));
});

test('events order.onCustomerReceive (email to seller, customer)', async ({ assert }) => {
  const listener = new OrderListener();
  await listener.onCustomerReceive({ order, lot });
  const all = Mail.all();
  const customerEmail = findMailByEmail(all, userCustomer.email);
  const sellerEmail = findMailByEmail(all, userSeller.email);

  assert.equal(customerEmail.message.to[0].address, userCustomer.email);
  assert.equal(customerEmail.message.html, View.render('emails.order.received-customer', {
    user: userCustomer,
    lot,
    frontUrl,
  }));

  assert.equal(sellerEmail.message.to[0].address, userSeller.email);
  assert.equal(sellerEmail.message.html, View.render('emails.order.received-seller', {
    user: userSeller,
    lot,
    frontUrl,
  }));
});
