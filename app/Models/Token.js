'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

const CONFIRMATION_TOKEN = 'confirmation';

const REMEMBER_TOKEN = 'remember';

class Token extends Model {
}

module.exports = Token;
module.exports.CONFIRMATION_TOKEN = CONFIRMATION_TOKEN;
module.exports.REMEMBER_TOKEN = REMEMBER_TOKEN;
