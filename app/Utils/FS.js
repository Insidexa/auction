const Utils = use('Helpers');
const Drive = use('Drive');
const ImageService = use('App/Services/ImageService');
const TokenMaker = use('App/Services/TokenMaker');

function fullPathUpload (image) {
  return `${Utils.publicPath()}${image}`;
}

async function removeIfExists (relativePath) {
  const fullPath = fullPathUpload(relativePath);
  if (await Drive.exists(fullPath)) {
    await Drive.delete(fullPath);
  }
}

function saveImageFromBase64 (base64, relativeDirectory = '/images/') {
  const name = TokenMaker.make();
  const relativePath = `${relativeDirectory}${name}.jpg`;
  ImageService.fromBase64(base64).saveTo(fullPathUpload(relativePath));

  return relativePath;
}

module.exports.fullPathUpload = fullPathUpload;
module.exports.removeIfExists = removeIfExists;
module.exports.saveImageFromBase64 = saveImageFromBase64;
