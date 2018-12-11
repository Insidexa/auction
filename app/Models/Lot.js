'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const Helpers = use('Helpers');
const ImageService = use('App/Services/ImageService');
const Drive = use('Drive');
const TokenMaker = use('App/Services/TokenMaker');

// created with entity default
const PENDING_STATUS = 0;

// changed, lot start time become
const IN_PROCESS_STATUS = 1;

// closed, lot time end
const CLOSED_STATUS = 2;

class Lot extends Model {
  static scopeInProcess (query) {
    return query.where('status', IN_PROCESS_STATUS);
  }

  static scopeInPending (query) {
    return query.where('status', PENDING_STATUS);
  }

  user () {
    return this.belongsTo('App/Models/User');
  }

  isPending () {
    return this.status === PENDING_STATUS;
  }

  statusProcessing () {
    this.status = IN_PROCESS_STATUS;
  }

  statusClosed () {
    this.status = CLOSED_STATUS;
  }

  fillImage (base64) {
    const name = TokenMaker.make();
    const clientPath = `/images/${name}.jpg`;
    const uploadDirectory = `${Helpers.publicPath()}`;
    ImageService.fromBase64(base64).saveTo(`${uploadDirectory}${clientPath}`);
    this.image = clientPath;
  }

  async removeImage () {
    const fullPath = `${Helpers.publicPath()}${this.image}`;
    if (await Drive.exists(fullPath)) {
      await Drive.delete(fullPath);
    }
  }
}

module.exports = Lot;
module.exports.PENDING_STATUS = PENDING_STATUS;
module.exports.IN_PROCESS_STATUS = IN_PROCESS_STATUS;
module.exports.CLOSED_STATUS = CLOSED_STATUS;
