'use strict';

const {
  test, trait, afterEach, beforeEach,
} = use('Test/Suite')('Bid Validation');
const Route = use('Route');
const Factory = use('Factory');
const Lot = use('App/Models/Lot');
const Moment = use('App/Utils/Moment');
const User = use('App/Models/User');
const Order = use('App/Models/Order');
const Bid = use('App/Models/Bid');
const userCustomData = require('../../utils/userCustomData');
const { cleanUpDB } = require('../../utils/utils');

let userAuth = null;
let lot = null;
let userLotCreator = null;
const lotCurrentPrice = 100;

trait('Test/ApiClient');
trait('Auth/Client');

beforeEach(async () => {
  const email = 'other@g.ci';
  const user = await Factory.model('App/Models/User').create({
    email,
    email_confirmed: true,
  });
  userLotCreator = await Factory.model('App/Models/User').create({
    email: userCustomData.confirmedEmail,
    email_confirmed: true,
  });
  lot = await Factory.model('App/Models/Lot').create({
    title: 'title',
    start_time: Moment().subtract(1, 'hours').format(Lot.formatTimeType),
    end_time: Moment().add(1, 'hours').format(Lot.formatTimeType),
    status: Lot.IN_PROCESS_STATUS,
    user_id: userLotCreator.id,
    current_price: lotCurrentPrice,
  });
  userAuth = await User.findBy('email', user.email);
});

afterEach(async () => {
  await cleanUpDB();
});

test('POST bids.store (validate lot not found), 404', async ({ client }) => {
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

  response.assertStatus(422);
  response.assertJSONSubset({
    message: 'ValidationException',
    description: [
      {
        message: 'Lot 1 not found',
        field: 'proposed_price',
        validation: 'bidPrice',
      },
    ],
  });
});

test('POST bids.store (validate propose lot creator), 403', async ({ client }) => {
  const response = await client
    .post(Route.url('bids.store'))
    .send({
      lot_id: lot.id,
      proposed_price: lotCurrentPrice,
    })
    .loginVia(userLotCreator)
    .end();

  response.assertStatus(403);
  response.assertJSON({
    message: 'CannotBuyYourselfLot',
  });
});

test('POST bids.store (validate price less lot current), 422', async ({ client }) => {
  const response = await client
    .post(Route.url('bids.store'))
    .send({
      lot_id: lot.id,
      proposed_price: lotCurrentPrice - 1,
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(422);
  response.assertJSON({
    message: 'ValidationException',
    description: [
      {
        message: 'Your propose must more lot current price',
        field: 'proposed_price',
        validation: 'bidPrice',
      },
    ],
  });
});

test('POST bids.store (validate bid less proposed prev), 422', async ({ client }) => {
  await Factory.model('App/Models/Bid').create({
    proposed_price: lotCurrentPrice + 10,
    lot_id: lot.id,
    user_id: userAuth.id,
  });

  const response = await client
    .post(Route.url('bids.store'))
    .send({
      lot_id: lot.id,
      proposed_price: lotCurrentPrice + 5,
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(422);
  response.assertJSON({
    message: 'ValidationException',
    description: [
      {
        message: 'Your propose must more previous bid propose',
        field: 'proposed_price',
        validation: 'bidPrice',
      },
    ],
  });
});
