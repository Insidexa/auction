'use strict';

const Channel = require('@adonisjs/websocket/src/Channel');
const Manager = require('@adonisjs/websocket/src/Channel/Manager');
const Socket = require('@adonisjs/websocket/src/Socket');

const {
  test, trait, afterEach, beforeEach, before, after,
} = use('Test/Suite')('LotPage Events');
const Factory = use('Factory');
const Lot = use('App/Models/Lot');
const Moment = use('App/Utils/Moment');
const LotPageListener = use('App/Listeners/LotPageListener');
const Queue = use('Kue/Queue');
const LotJobService = use('LotJobService');
const JobService = use('JobService');
const Ws = use('Ws');
const {
  cleanUpDB, jobServiceTestMode, kueTestModeExtend,
  restoreKue, cleanUpLotRedisData, FakeWSConnection,
} = require('../../utils/utils');

let user = null;
let lot = null;

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
  });
  LotJobService.runJobs(lot);
});

afterEach(async () => {
  Queue.testMode.clear();
  await cleanUpLotRedisData();
  await cleanUpDB();
});

test('events lotPage.onCreateBid (check data send to ws)', async ({ assert }) => {
  const bid = await Factory.model('App/Models/Bid').create({
    proposed_price: lot.estimated_price / 2,
    user_id: user.id,
    lot_id: lot.id,
  });

  const lotChannelName = 'lot:*';
  Manager.channels.set('lot:*', new Channel(lotChannelName, (() => {})));

  const write = (payload) => {
    assert.deepEqual(payload, { topic: `lot:${lot.id}`, event: 'bidsCollection:new', data: bid });
  };

  const clientFakeConnection = new FakeWSConnection();
  clientFakeConnection.write = write;

  const clientCtx = {
    socket: new Socket(`lot:${lot.id}`, clientFakeConnection),
  };

  const lotChannel = Ws.getChannel(lotChannelName);

  await lotChannel.joinTopic(clientCtx);

  const listener = new LotPageListener();
  await listener.onCreateBid(bid);
});
