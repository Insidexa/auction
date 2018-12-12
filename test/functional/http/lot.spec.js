'use strict';

const mockdate = require('mockdate');

const {
  test, trait, before, after, beforeEach, afterEach,
} = use('Test/Suite')('Lot');
const Route = use('Route');
const Drive = use('Drive');
const Factory = use('Factory');
const User = use('App/Models/User');
const Lot = use('App/Models/Lot');
const LotFilterDto = use('App/Dto/LotFilterDto');
const { fullPathUpload, removeIfExists, saveImageFromBase64 } = use('App/Utils/FS');
const userCustomData = require('../../utils/userCustomData');
const { makeBase64 } = require('../../utils/utils');

trait('Test/ApiClient');
trait('Auth/Client');

before(async () => {
  mockdate.set('2018-10-10');
});

after(async () => {
  mockdate.reset();
});

afterEach(async () => {
  const lots = await Lot.all();
  // eslint-disable-next-line no-restricted-syntax
  for (const lot of lots.rows) {
    await removeIfExists(lot.image);
    await lot.delete();
  }
  await User.query().delete();
});

beforeEach(async () => {
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
  await Factory.model('App/Models/Lot').create({
    title: 'Lotimg',
    start_time: '2018-12-12 10:00:00',
    end_time: '2018-12-13 10:00:00',
    status: Lot.PENDING_STATUS,
    user_id: user.id,
  });
});

test('lot store', async ({ assert, client }) => {
  const user = await User.findBy('email', userCustomData.confirmedEmail);
  const lot = await Factory.model('App/Models/Lot').make({
    start_time: '2018-12-12 10:00:00',
    end_time: '2018-12-12 10:00:00',
    image: null,
  });

  const response = await client
    .post(Route.url('profile.lots.store'))
    .send(lot.toJSON())
    .loginVia(user)
    .end();

  response.assertStatus(200);

  const lotDB = await Lot.findBy('title', lot.title);
  assert.isTrue(!!lotDB);
});

test('lot store with image', async ({ assert, client }) => {
  const user = await User.findBy('email', userCustomData.confirmedEmail);
  const lot = await Factory.model('App/Models/Lot').make({
    start_time: '2018-12-12 10:00:00',
    end_time: '2018-12-12 10:00:00',
  });

  lot.image = await makeBase64();

  const response = await client
    .post(Route.url('profile.lots.store'))
    .send(lot.toJSON())
    .loginVia(user)
    .end();

  response.assertStatus(200);

  const lotDB = await Lot.findBy('title', lot.title);
  const imagePath = fullPathUpload(lotDB.image);
  const isExistsLotImage = await Drive.exists(imagePath);

  assert.isTrue(!!lotDB);
  assert.isTrue(isExistsLotImage);
});

test('lot destroy not found', async ({ client }) => {
  await Lot.query().delete();
  const user = await User.findBy('email', userCustomData.confirmedEmail);
  const response = await client
    .delete(Route.url('profile.lots.destroy', { id: 1 }))
    .loginVia(user)
    .end();

  response.assertStatus(404);
});

test('lot destroy found', async ({ client }) => {
  const user = await User.findBy('email', userCustomData.confirmedEmail);
  const lot = await Lot.first();
  const response = await client
    .delete(Route.url('profile.lots.destroy', { id: lot.id }))
    .loginVia(user)
    .end();

  response.assertStatus(200);
});

test('lot destroy non pending status', async ({ client }) => {
  const user = await User.findBy('email', userCustomData.confirmedEmail);
  const lot = await Lot.first();
  lot.status = Lot.IN_PROCESS_STATUS;
  await lot.save();

  const response = await client
    .delete(Route.url('profile.lots.destroy', { id: lot.id }))
    .loginVia(user)
    .end();

  response.assertStatus(403);
});

test('lot destroy with image', async ({ client, assert }) => {
  const user = await User.findBy('email', userCustomData.confirmedEmail);
  const lot = await Lot.first();
  lot.image = saveImageFromBase64(await makeBase64());
  await lot.save();

  const response = await client
    .delete(Route.url('profile.lots.destroy', { id: lot.id }))
    .loginVia(user)
    .end();

  response.assertStatus(200);

  const imagePath = fullPathUpload(lot.image);
  const existsImage = await Drive.exists(imagePath);

  assert.isFalse(existsImage);
});

test('lot update in non pending status', async ({ client }) => {
  const user = await User.findBy('email', userCustomData.confirmedEmail);
  const lot = await Lot.first();
  lot.status = Lot.IN_PROCESS_STATUS;
  await lot.save();

  const response = await client
    .put(Route.url('profile.lots.update', { id: lot.id }))
    .send({
      title: lot.title,
      description: lot.description,
      start_time: lot.start_time,
      end_time: lot.end_time,
      current_price: lot.current_price,
      estimated_price: lot.estimated_price,
    })
    .loginVia(user)
    .end();

  response.assertStatus(403);
  response.assertJSONSubset({
    message: 'LotActiveCannotDelete',
  });
});

test('lot update with image', async ({ assert, client }) => {
  const user = await User.findBy('email', userCustomData.confirmedEmail);
  const lot = await Lot.first();
  lot.image = saveImageFromBase64(await makeBase64());
  await lot.save();
  const oldImage = lot.image;
  const response = await client
    .put(Route.url('profile.lots.update', { id: lot.id }))
    .send({
      ...lot.toJSON(),
      image: await makeBase64(),
    })
    .loginVia(user)
    .end();

  response.assertStatus(200);

  const oldPath = fullPathUpload(oldImage);
  const existsOldImage = await Drive.exists(oldPath);

  assert.isFalse(existsOldImage);

  const imagePath = fullPathUpload(lot.image);
  const existsImage = await Drive.exists(imagePath);
  assert.isFalse(existsImage);
});

test('lot show not found', async ({ client }) => {
  await Lot.query().delete();
  const user = await User.findBy('email', userCustomData.confirmedEmail);
  const response = await client
    .get(Route.url('profile.lots.page', { id: 1 }))
    .loginVia(user)
    .end();

  response.assertStatus(404);
});

test('lot show found', async ({ client }) => {
  const user = await User.findBy('email', userCustomData.confirmedEmail);
  const lot = await Lot.first();
  const response = await client
    .get(Route.url('profile.lots.page', { id: lot.id }))
    .loginVia(user)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: lot.toJSON(),
  });
});

test('lot filter only process status ', async ({ client }) => {
  const user = await User.findBy('email', userCustomData.confirmedEmail);
  const lot = await Lot.first();
  lot.status = Lot.IN_PROCESS_STATUS;
  await lot.save();

  const response = await client
    .get(Route.url('profile.lots'))
    .loginVia(user)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      data: [
        {
          status: Lot.IN_PROCESS_STATUS,
        },
      ],
    },
  });
});

test('lot self type created ', async ({ client }) => {
  const user = await User.findBy('email', userCustomData.confirmedEmail);
  const anotherUser = await User.findBy('email', 'other@g.ci');

  await Factory.model('App/Models/Lot').create({
    title: 'Lotimg',
    start_time: '2018-12-12 10:00:00',
    end_time: '2018-12-13 10:00:00',
    status: Lot.CLOSED_STATUS,
    user_id: anotherUser.id,
  });

  const response = await client
    .get(`${Route.url('profile.lots.self')}?type=${LotFilterDto.CREATED}`)
    .loginVia(user)
    .end();

  response.assertStatus(200);
  response.assertJSONSubset({
    data: {
      data: [
        {
          user_id: user.id,
        },
      ],
    },
  });
});
