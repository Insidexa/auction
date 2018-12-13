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
const FS = use('FSService');
const Database = use('Database');
const Kue = use('App/Utils/Kue');
const Redis = use('Redis');
const userCustomData = require('../../utils/userCustomData');
const { makeBase64 } = require('../../utils/utils');

trait('Test/ApiClient');
trait('Auth/Client');

const queue = new KueMock(Kue);
const title = 'lot-title';
let lotForTests = null;
let userAuth = null;
let lotStartJobStub = null;
let lotEndJobStub = null;

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
  await Lot.query().delete();
  await User.query().delete();
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
  await Factory.model('App/Models/User').create({
    email: 'other@g.ci',
    password: userCustomData.password,
    email_confirmed: true,
  });
  lotForTests = await Factory.model('App/Models/Lot').create({
    title,
    start_time: '2018-12-12 10:00:00',
    end_time: '2018-12-13 10:00:00',
    status: Lot.PENDING_STATUS,
    user_id: user.id,
  });
  userAuth = await User.findBy('email', userCustomData.confirmedEmail);
});

test('lot store without image', async ({ assert, client }) => {
  const lot = await Factory.model('App/Models/Lot').make({
    start_time: '2018-12-12 10:00:00',
    end_time: '2018-12-12 11:00:00',
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

test('lot store with image', async ({ assert, client }) => {
  const lotTitle = 'lot with image';
  const response = await client
    .post(Route.url('lots.store'))
    .send({
      title: lotTitle,
      current_price: 10,
      estimated_price: 1000,
      start_time: '2018-12-12 10:00:00',
      end_time: '2018-12-12 11:00:00',
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

test('lot destroy not found', async ({ client }) => {
  await Lot.query().delete();
  const response = await client
    .delete(Route.url('lots.destroy', { id: 1 }))
    .loginVia(userAuth)
    .end();

  response.assertStatus(404);
});

test('lot destroy found', async ({ client }) => {
  const response = await client
    .delete(Route.url('lots.destroy', { id: lotForTests.id }))
    .loginVia(userAuth)
    .end();

  response.assertStatus(204);
});

test('lot destroy non pending status', async ({ client }) => {
  lotForTests.status = Lot.IN_PROCESS_STATUS;
  await lotForTests.save();

  const response = await client
    .delete(Route.url('lots.destroy', { id: lotForTests.id }))
    .loginVia(userAuth)
    .end();

  response.assertStatus(403);
});

test('lot destroy with image', async ({ client, assert }) => {
  lotForTests.image = await makeBase64();
  await lotForTests.save();

  const response = await client
    .delete(Route.url('lots.destroy', { id: lotForTests.id }))
    .loginVia(userAuth)
    .end();

  response.assertStatus(204);

  const imagePath = FS.fullPathUpload(lotForTests.image);
  const existsImage = await Drive.exists(imagePath);

  assert.isFalse(existsImage);
});

test('lot update in non pending status', async ({ client }) => {
  lotForTests.status = Lot.IN_PROCESS_STATUS;
  await lotForTests.save();

  const response = await client
    .put(Route.url('lots.update', { id: lotForTests.id }))
    .send(lotForTests.toJSON())
    .loginVia(userAuth)
    .end();

  response.assertStatus(403);
  response.assertJSONSubset({
    message: 'LotActiveCannotDelete',
  });
});

test('lot update with image', async ({ assert, client }) => {
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

test('lot show not found', async ({ client }) => {
  await Lot.query().delete();
  const response = await client
    .get(Route.url('lots.page', { id: 1 }))
    .end();

  response.assertStatus(404);
});

test('lot show found', async ({ client }) => {
  const lot = await Lot.find(lotForTests.id);
  const response = await client
    .get(Route.url('lots.page', { id: lotForTests.id }))
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: lot.toJSON(),
  });
});

test('lot filter only process status ', async ({ client }) => {
  lotForTests.status = Lot.IN_PROCESS_STATUS;
  await lotForTests.save();

  const response = await client
    .get(Route.url('lots.all'))
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: [
      {
        status: Lot.IN_PROCESS_STATUS,
      },
    ],
  });
});

test('lot self type created ', async ({ client }) => {
  const anotherUser = await User.findBy('email', 'other@g.ci');

  await Factory.model('App/Models/Lot').create({
    title: 'Lotimg',
    start_time: '2018-12-12 10:00:00',
    end_time: '2018-12-13 10:00:00',
    status: Lot.CLOSED_STATUS,
    user_id: anotherUser.id,
  });

  const response = await client
    .get(`${Route.url('lots.self')}?type=all`)
    .loginVia(userAuth)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: [
      {
        user_id: userAuth.id,
      },
    ],
  });
});

test('lot pagination filter process status', async ({ client }) => {
  lotForTests.status = Lot.IN_PROCESS_STATUS;
  await lotForTests.save();

  const perPage = 11;
  const page = 1;
  const response = await client
    .get(Route.url('lots.all'))
    .send({
      perPage,
      page,
    })
    .loginVia(userAuth)
    .end();

  response.assertJSONSubset({
    data: [
      {
        title: lotForTests.title,
      },
    ],
  });
});

test('lot pagination filter self created lots', async ({ client }) => {
  const perPage = 11;
  const page = 1;
  const response = await client
    .get(Route.url('lots.self'))
    .send({
      perPage,
      page,
    })
    .loginVia(userAuth)
    .end();

  response.assertJSONSubset({
    data: [
      {
        title: lotForTests.title,
      },
    ],
  });
});

test('lot pagination check remain', async ({ client }) => {
  const total = 35;
  const lastLotsIds = [];
  for (let i = 0; i < total; i++) {
    const lot = await Factory.model('App/Models/Lot').create({
      status: Lot.IN_PROCESS_STATUS,
      user_id: userAuth.id,
      start_time: '2018-10-10 10:00:00',
      end_time: '2018-10-10 11:00:00',
    });
    if (i > 30) {
      lastLotsIds.push({ id: lot.id });
    }
  }

  const perPage = 10;
  const page = 4;
  const response = await client
    .get(Route.url('lots.all'))
    .send({
      perPage,
      page,
    })
    .end();

  response.assertJSONSubset({
    data: lastLotsIds,
    meta: {
      total: total.toString(),
      lastPage: page,
      page,
      perPage,
    },
  });
});

test('lot pagination negative params', async ({ client }) => {
  const perPage = -10;
  const page = -1;
  const response = await client
    .get(Route.url('lots.self'))
    .loginVia(userAuth)
    .send({
      type: 'created',
      perPage,
      page,
    })
    .end();

  response.assertStatus(500);
  response.assertJSONSubset({
    message: 'error',
  });
});
