'use strict';

const Utils = use('Helpers');
const Drive = use('Drive');
const ImageService = use('ImageService');
const TokenMaker = use('TokenMaker');

class FSService {
  fullPathUpload (relativePath) {
    return `${Utils.publicPath()}${relativePath}`;
  }

  async removeIfExists (relativePath) {
    const fullPath = this.fullPathUpload(relativePath);
    if (await Drive.exists(fullPath)) {
      await Drive.delete(fullPath);
    }
  }

  async saveImageFromBase64 (base64, relativeDirectory = '/images/') {
    const name = TokenMaker.make();
    const relativePath = `${relativeDirectory}${name}.jpg`;
    const fullPath = this.fullPathUpload(relativePath);
    const buffer = ImageService.fromBase64(base64).getBuffer();
    await Drive.put(fullPath, buffer);

    return relativePath;
  }
}

module.exports = FSService;
