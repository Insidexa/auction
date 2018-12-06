const sharp = require('sharp');

class ImageService {
  constructor (buffer) {
    this.transformer = sharp(buffer);
  }

  resize (value) {
    this.transformer.resize(value);
  }

  getBuffer () {
    return this.transformer.toBuffer();
  }

  getImage (path) {
    return this.transformer.toFile(path);
  }

  /**
   * @param {string} base64 without metadata
   * @returns {ImageService}
   */
  static fromBase64 (base64) {
    const buffer = Buffer.from(base64, 'base64');
    return new ImageService(buffer);
  }
}

module.exports = ImageService;
