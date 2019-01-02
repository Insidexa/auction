'use strict';

const uuidv4 = require('uuid/v4');

const Drive = use('Drive');
const FS = use('FSService');
const Mail = use('Mail');
const Redis = use('Redis');
const Database = use('Database');
const Kue = use('App/Utils/Kue');

const kueOriginalJobGet = Kue.Job.prototype.get;
const kueOriginalJobRemove = Kue.Job.prototype.remove;

async function makeBase64 () {
  const image = await Drive.get(FS.fullPathUpload('/example.jpg'));
  return Buffer.from(image).toString('base64');
}

function fakeMail () {
  Mail.fake();
}

async function cleanUpDB () {
  await Database.table('orders').delete();
  await Database.table('arrival_types').delete();
  await Database.table('delivery_types').delete();
  await Database.table('bids').delete();
  await Database.table('lots').delete();
  await Database.table('tokens').delete();
  await Database.table('users').delete();
}

/**
 * cleanup lot queue data ( lot jobs start and end ids )
 * because in some tests only store test, but not delete http way
 * http way removing lots deleting jobs and lot queue data
 */
async function cleanUpLotRedisData () {
  const keys = await Redis.keys('lot_*_queue_data');
  // eslint-disable-next-line no-restricted-syntax
  for (const key of keys) {
    await Redis.del(key);
  }
}

/**
 * Its need by one reason:
 * api testMode not all impl other features kue
 * In testMode create job only synchronous in memory job array
 * @example
 *    const job = this.queue
 *       .create(jobName, payload)
 *       .delay(delay);
 *    job.save();
 *
 * But in real time its work only asynchronous,
 * because use redis, not jobs array in memory:
 * We get Job id only callback save function called
 * @example
 *    const job = this.queue
 *       .create(jobName, payload)
 *       .delay(delay)
 *       .save((err) => console.log(job.id))
 */
function jobServiceTestMode (jobService) {
  jobService.dispatch = async function(jobName, payload, delay) {
    const job = this.queue
      .create(jobName, payload)
      .delay(delay);

    job.save();

    return job;
  };
}

/**
 * Replace getting job by id because testMode
 * not allow and not implemented this features
 * https://github.com/Automattic/kue/blob/master/lib/queue/test_mode.js
 * Only impl: save, update
 */
function kueTestModeExtend (Queue) {
  Kue.Job.get = (id, fn) => {
    const findJob = Queue.testMode.jobs.find(job => job.id === id);
    fn(null, findJob);
  };
  Kue.Job.prototype.remove = function(fn) {
    const jobIndex = Queue.testMode.jobs.findIndex(job => job.id === this.id);
    Queue.testMode.jobs.splice(jobIndex, 1);
    fn();
  };
}

/**
 * Restore original kue after extending testMode
 */
function restoreKue () {
  Kue.Job.get = kueOriginalJobGet;
  Kue.Job.remove = kueOriginalJobRemove;
}

function findMailByEmail (mails, email) {
  return mails
    .find(mail => mail.message.to.map(to => to.address).includes(email));
}

async function createTestArrivalType () {
  const [pickupId] = await Database
    .into('delivery_types')
    .returning('id')
    .insert({ name: 'pickup' });

  return await Database
    .into('arrival_types')
    .returning('id')
    .insert({ delivery_type_id: pickupId, name: 'Pickup test' });
}

class FakeWSConnection {
  constructor (id) {
    this.id = id || uuidv4();
  }

  encodePacket (message, cb) {
    cb(null, message);
  }

  makeEventPacket (topic, event, data) {
    return { topic, event, data };
  }

  sendLeavePacket () {
  }
}

module.exports = {
  makeBase64,
  fakeMail,
  cleanUpDB,
  cleanUpLotRedisData,
  kueTestModeExtend,
  restoreKue,
  jobServiceTestMode,
  findMailByEmail,
  createTestArrivalType,
  FakeWSConnection,
};
