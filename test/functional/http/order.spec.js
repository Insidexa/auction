'use strict';

const {
  test, trait, beforeEach, afterEach, before, after,
} = use('Test/Suite')('Order');
const Route = use('Route');
const Factory = use('Factory');
const Event = use('Event');
const Moment = use('App/Utils/Moment');
const Lot = use('App/Models/Lot');
const Order = use('App/Models/Order');
const {
  fakeMail, cleanUpDB, createTestArrivalType,
} = require('../../utils/utils');

let userCustomer = null;
let userSeller = null;
let otherUser = null;
let lotClosed = null;
let bid = null;
let order = null;
let arrivalTypeId = null;

trait('Test/ApiClient');
trait('Auth/Client');

before(async () => {
  Event.fake();
  fakeMail();
});

after(async () => {
  Event.restore();
});

beforeEach(async () => {
  const [id] = await createTestArrivalType();
  arrivalTypeId = id;
  userSeller = await Factory.model('App/Models/User').create({
    email: 'seller@g.co',
    email_confirmed: true,
  });
  userCustomer = await Factory.model('App/Models/User').create({
    email: 'customer@g.co',
    email_confirmed: true,
  });
  otherUser = await Factory.model('App/Models/User').create({
    email: 'other@g.co',
    email_confirmed: true,
  });

  const startLotTime = Moment().subtract(1, 'hours').format();
  const endLotTime = Moment().add(1, 'hours').format();
  lotClosed = await Factory.model('App/Models/Lot').create({
    title: 'lot title',
    start_time: startLotTime,
    end_time: endLotTime,
    status: Lot.CLOSED_STATUS,
    user_id: userSeller.id,
  });
  bid = await Factory.model('App/Models/Bid').create({
    user_id: userCustomer.id,
    lot_id: lotClosed.id,
    proposed_price: lotClosed.estimated_price,
  });
  order = await Factory.model('App/Models/Order').create({
    user_id: userCustomer.id,
    bid_id: bid.id,
    lot_id: lotClosed.id,
    arrival_type_id: arrivalTypeId,
  });
});

afterEach(async () => {
  await cleanUpDB();
  Event.clear();
});

test('GET orders.show (found with customer), 200', async ({ client }) => {
  const response = await client
    .get(Route.url('orders.show', { id: order.id }))
    .loginVia(userCustomer)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      id: order.id,
    },
  });
});

test('GET orders.show (found with seller), 200', async ({ client }) => {
  const response = await client
    .get(Route.url('orders.show', { id: order.id }))
    .loginVia(userSeller)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      id: order.id,
    },
  });
});

test('GET orders.show (not found with other user), 404', async ({ client }) => {
  const response = await client
    .get(Route.url('orders.show', { id: order.id }))
    .loginVia(otherUser)
    .end();

  response.assertStatus(404);
  response.assertJSONSubset({
    message: 'ModelNotFoundException',
  });
});

test('PUT orders.update (onCreate event), 200', async ({ client, assert }) => {
  const response = await client
    .put(Route.url('orders.update', { id: order.id }))
    .send({
      arrival_location: 'new address',
      arrival_type_id: arrivalTypeId,
    })
    .loginVia(userCustomer)
    .end();

  response.assertStatus(200);

  const createdEvent = Event.pullRecent();
  assert.equal('order::onCreate', createdEvent.event);
});

test('PUT orders.update (successfully), 200', async ({ client }) => {
  const requestData = {
    arrival_location: 'new address',
    arrival_type_id: arrivalTypeId,
  };
  const response = await client
    .put(Route.url('orders.update', { id: order.id }))
    .send(requestData)
    .loginVia(userCustomer)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      ...requestData,
      status: Order.PENDING_STATUS,
    },
  });
});

test('PUT orders.update (in non pending), 403', async ({ client }) => {
  await Order.query().delete();
  const orderInSendStatus = await Factory.model('App/Models/Order').create({
    arrival_type_id: arrivalTypeId,
    user_id: userCustomer.id,
    bid_id: bid.id,
    lot_id: lotClosed.id,
    status: Order.SEND_STATUS,
  });

  const response = await client
    .put(Route.url('orders.update', { id: orderInSendStatus.id }))
    .send({
      arrival_location: 'location',
      arrival_type_id: arrivalTypeId,
    })
    .loginVia(userCustomer)
    .end();

  response.assertStatus(403);
  response.assertBody({
    message: 'OrderStatusDenied',
  });
});

test('PUT orders.sellerExecute (executed event), 200', async ({ client, assert }) => {
  const response = await client
    .put(Route.url('orders.sellerExecute', { id: order.id }))
    .loginVia(userSeller)
    .end();

  response.assertStatus(200);

  const createdEvent = Event.pullRecent();
  assert.equal('order::onSellerExecute', createdEvent.event);
});

test('PUT orders.sellerExecute (middleware access denied), 403', async ({ client }) => {
  const response = await client
    .put(Route.url('orders.sellerExecute', { id: order.id }))
    .loginVia(userCustomer)
    .end();

  response.assertStatus(403);
  response.assertBody({
    message: 'OrderAccessDenied',
  });
});

test('PUT orders.sellerExecute (execute order), 200', async ({ client }) => {
  const response = await client
    .put(Route.url('orders.sellerExecute', { id: order.id }))
    .loginVia(userSeller)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      id: order.id,
      status: Order.SEND_STATUS,
    },
  });
});

test('PUT orders.customerReceive (received event), 200', async ({ client, assert }) => {
  order.status = Order.SEND_STATUS;
  await order.save();

  const response = await client
    .put(Route.url('orders.customerReceive', { id: order.id }))
    .loginVia(userCustomer)
    .end();

  response.assertStatus(200);

  const createdEvent = Event.pullRecent();
  assert.equal('order::onCustomerReceive', createdEvent.event);
});

test('PUT orders.customerReceive (receive order), 200', async ({ client }) => {
  order.status = Order.SEND_STATUS;
  await order.save();

  const response = await client
    .put(Route.url('orders.customerReceive', { id: order.id }))
    .loginVia(userCustomer)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      id: order.id,
      status: Order.DELIVERED_STATUS,
    },
  });
});
