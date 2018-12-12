const Drive = use('Drive');
const { fullPathUpload } = use('App/Utils/FS');

async function makeBase64 () {
  const image = await Drive.get(fullPathUpload('/images/example.jpg'));
  return Buffer.from(image).toString('base64');
}

module.exports.makeBase64 = makeBase64;
