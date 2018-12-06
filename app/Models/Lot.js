'use strict';

const uuidv4 = require('uuid/v4');
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');
const Helpers = use('Helpers');
const ImageService = use('App/Services/ImageService');

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

  user () {
    return this.belongsTo('App/Models/User');
  }

  fillImage (base64) {
    const name = uuidv4();
    const clientPath = `/images/${name}.jpg`;
    const uploadDirectory = `${Helpers.publicPath()}`;
    ImageService.fromBase64(base64).getImage(`${uploadDirectory}${clientPath}`);
    this.image = clientPath;
  }
}

module.exports = Lot;
module.exports.PENDING_STATUS = PENDING_STATUS;
module.exports.IN_PROCESS_STATUS = IN_PROCESS_STATUS;
module.exports.CLOSED_STATUS = CLOSED_STATUS;
