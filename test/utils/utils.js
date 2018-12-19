'use strict';

const Drive = use('Drive');
const FS = use('FSService');
const Mail = use('Mail');

async function makeBase64 () {
  const image = await Drive.get(FS.fullPathUpload('/example.jpg'));
  return Buffer.from(image).toString('base64');
}

function fakeMail () {
  Mail.fake();
}

module.exports = {
  makeBase64,
  fakeMail,
};
