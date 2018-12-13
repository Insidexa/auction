'use strict';

const uuidv4 = require('uuid/v4');

class TokenMaker {
  static make () {
    return uuidv4();
  }
}

module.exports = TokenMaker;
