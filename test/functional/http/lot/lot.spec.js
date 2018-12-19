'use strict';

/* eslint-disable no-restricted-syntax */

const mockdate = require('mockdate');
const KueMock = require('kue-mock');
const fs = require('fs');

const {
  test, trait, before, after, beforeEach, afterEach,
} = use('Test/Suite')('Lot');
const Route = use('Route');
const Drive = use('Drive');
const Factory = use('Factory');
const User = use('App/Models/User');
const Lot = use('App/Models/Lot');
const Bid = use('App/Models/Bid');
const FS = use('FSService');
const Database = use('Database');
const Kue = use('App/Utils/Kue');
const Moment = use('App/Utils/Moment');
const Redis = use('Redis');
const userCustomData = require('../../../utils/userCustomData');
const { makeBase64, cleanUpDB } = require('../../../utils/utils');

trait('Test/ApiClient');
trait('Auth/Client');

const queue = new KueMock(Kue);
const title = 'lot-title';
const prices = [300, 200, 100];
let lotForTests = null;
let lotForBid = null;
let userAuth = null;
let otherUser = null;
let otherLot = null;
let lotStartJobStub = null;
let lotEndJobStub = null;
const startLotTime = Moment().subtract(1, 'hours').format(Lot.formatTimeType);
const endLotTime = Moment().add(1, 'hours').format(Lot.formatTimeType);

before(async () => {
  mockdate.set('2018-10-10');
});

after(async () => {
  mockdate.reset();
  const uploadDirectory = FS.fullPathUpload('/images/');
  const files = fs.readdirSync(uploadDirectory);
  for (const fileName of files) {
    await Drive.delete(`${uploadDirectory}${fileName}`);
  }
});

afterEach(async () => {
  /**
   * https://adonisjs.com/docs/4.1/lucid#_bulk_deletes
   * not firing any hooks, not removing images after deleted lot
   */
  await cleanUpDB();
  lotStartJobStub.restore();
  lotEndJobStub.restore();
  /**
   * cleanup lot queue data ( lot jobs start and end ids )
   * because in some tests only store test, but not delete http way
   * http way removing lots deleting jobs and lot queue data
   */
  const keys = await Redis.keys('lot_*_queue_data');
  for (const key of keys) {
    await Redis.del(key);
  }
});

beforeEach(async () => {
  queue.clean();
  lotStartJobStub = queue.stub('LotStart');
  lotEndJobStub = queue.stub('LotEnd');
  const user = await Factory.model('App/Models/User').create({
    email: userCustomData.confirmedEmail,
    password: userCustomData.password,
    email_confirmed: true,
  });
  otherUser = await Factory.model('App/Models/User').create({
    email: 'other@g.ci',
    password: userCustomData.password,
    email_confirmed: true,
  });
  otherLot = await Factory.model('App/Models/Lot').create({
    title: 'lot title',
    start_time: startLotTime,
    end_time: endLotTime,
    status: Lot.IN_PROCESS_STATUS,
    user_id: otherUser.id,
    estimated_price: 1000,
  });
  lotForTests = await Factory.model('App/Models/Lot').create({
    title,
    start_time: startLotTime,
    end_time: endLotTime,
    status: Lot.PENDING_STATUS,
    user_id: user.id,
  });
  lotForBid = await Factory.model('App/Models/Lot').create({
    title,
    start_time: startLotTime,
    end_time: endLotTime,
    status: Lot.PENDING_STATUS,
    user_id: user.id,
  });
  for (const price of prices) {
    await Factory.model('App/Models/Bid').create({
      user_id: user.id,
      lot_id: lotForTests.id,
      proposed_price: price,
    });
  }
  await Factory.model('App/Models/Bid').create({
    user_id: user.id,
    lot_id: otherLot.id,
    proposed_price: 900,
  });
  userAuth = await User.findBy('email', userCustomData.confirmedEmail);
});

test('POST lots.store (without image), 200', async ({ assert, client }) => {
  const lot = await Factory.model('App/Models/Lot').make({
    start_time: startLotTime,
    end_time: endLotTime,
    image: null,
  });

  const response = await client
    .post(Route.url('lots.store'))
    .send(lot.toJSON())
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);

  const lotDB = await Lot.findBy('title', lot.title);
  assert.isTrue(!!lotDB);
});

test('POST lots.store (with image), 200', async ({ assert, client }) => {
  const lotTitle = 'lot with image';
  const response = await client
    .post(Route.url('lots.store'))
    .send({
      title: lotTitle,
      current_price: 10,
      estimated_price: 1000,
      start_time: startLotTime,
      end_time: endLotTime,
      image: await makeBase64(),
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);

  const lotDB = await Lot.findBy({ title: lotTitle });
  const imagePath = FS.fullPathUpload(lotDB.image);
  const isExistsLotImage = await Drive.exists(imagePath);

  assert.isTrue(!!lotDB);
  assert.isTrue(isExistsLotImage);
});

test('DELETE lots.destroy (not found), 404', async ({ client }) => {
  await Bid.query().delete();
  await Lot.query().delete();
  const response = await client
    .delete(Route.url('lots.destroy', { id: 1 }))
    .loginVia(userAuth)
    .end();

  response.assertStatus(404);
});

test('DELETE lot.destroy (found), 204', async ({ client }) => {
  const response = await client
    .delete(Route.url('lots.destroy', { id: lotForBid.id }))
    .loginVia(userAuth)
    .end();

  response.assertStatus(204);
});

test('DELETE lots.destroy (in non pending status), 403', async ({ client }) => {
  await Bid.query().delete();
  lotForBid.status = Lot.IN_PROCESS_STATUS;
  await lotForBid.save();

  const response = await client
    .delete(Route.url('lots.destroy', { id: lotForBid.id }))
    .loginVia(userAuth)
    .end();

  response.assertStatus(403);
});

test('DELETE lots.destroy (check remove with img), 200', async ({ client, assert }) => {
  lotForBid.image = await makeBase64();
  await lotForBid.save();

  const response = await client
    .delete(Route.url('lots.destroy', { id: lotForBid.id }))
    .loginVia(userAuth)
    .end();

  response.assertStatus(204);

  const imagePath = FS.fullPathUpload(lotForTests.image);
  const existsImage = await Drive.exists(imagePath);

  assert.isFalse(existsImage);
});

test('PUT lots.update (in non pending status), 403', async ({ client }) => {
  lotForTests.status = Lot.IN_PROCESS_STATUS;
  await lotForTests.save();

  const response = await client
    .put(Route.url('lots.update', { id: lotForTests.id }))
    .send(lotForTests.toJSON())
    .loginVia(userAuth)
    .end();

  response.assertStatus(403);
  response.assertJSONSubset({
    message: 'LotActiveCannotUpdate',
  });
});

test('PUT lots.update (with image and remove old img), 200', async ({ assert, client }) => {
  /** using Database over lucid Model
   * because not firing any hooks
   * example: lot exists with uploaded image
   * problem: when using Lot Model fire hook beforeSave
   *          and pass image path to LotHook.beforeSave (/images/example.jpg)
   *          and when goto saveImageFromBase64 -> Buffer.from -> getting error
   *          because not buffer
   */
  await Database
    .table('lots')
    .where('id', lotForTests.id)
    .update({
      image: await FS.saveImageFromBase64(await makeBase64()),
    });

  const oldImage = lotForTests.image;
  const response = await client
    .put(Route.url('lots.update', { id: lotForTests.id }))
    .send({
      ...lotForTests.toJSON(),
      image: await makeBase64(),
    })
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);

  const oldPath = FS.fullPathUpload(oldImage);
  const existsOldImage = await Drive.exists(oldPath);

  assert.isFalse(existsOldImage);

  const imagePath = FS.fullPathUpload(lotForTests.image);
  const existsImage = await Drive.exists(imagePath);
  assert.isFalse(existsImage);
});

test('GET lots.show (not found), 404', async ({ client }) => {
  await Bid.query().delete();
  await Lot.query().delete();
  const response = await client
    .get(Route.url('lots.show', { id: 1 }))
    .loginVia(userAuth)
    .end();

  response.assertStatus(404);
});

test('GET lots.show (found), 200', async ({ client }) => {
  const lot = await Lot.find(lotForTests.id);
  const response = await client
    .get(Route.url('lots.show', { id: lotForTests.id }))
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: lot.toJSON(),
  });
});
