'use strict';

const sharp = require('sharp');

class ImageService {
  constructor (input) {
    this.transformer = sharp(input);
  }

  resize (value) {
    this.transformer.resize(value);
  }

  getBuffer () {
    return this.transformer.toBuffer();
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
