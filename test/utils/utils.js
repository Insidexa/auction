'use strict';

const Drive = use('Drive');
const FS = use('FSService');
const Mail = use('Mail');
const Database = use('Database');

async function makeBase64 () {
  const image = await Drive.get(FS.fullPathUpload('/example.jpg'));
  return Buffer.from(image).toString('base64');
}

function fakeMail () {
  Mail.fake();
}

async function cleanUpDB () {
  await Database.table('orders').delete();
  await Database.table('bids').delete();
  await Database.table('lots').delete();
  await Database.table('tokens').delete();
  await Database.table('users').delete();
}

module.exports = {
  makeBase64,
  fakeMail,
  cleanUpDB,
};
