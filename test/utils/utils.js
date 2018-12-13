'use strict';

const Drive = use('Drive');
const FS = use('FSService');

async function makeBase64 () {
  const image = await Drive.get(FS.fullPathUpload('/example.jpg'));
  return Buffer.from(image).toString('base64');
}

module.exports.makeBase64 = makeBase64;
