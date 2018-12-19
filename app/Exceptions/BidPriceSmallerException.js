'use strict';

const { LogicalException } = require('@adonisjs/generic-exceptions');

class BidPriceSmallerException extends LogicalException {
  /**
   * Handle this exception by itself
   */
  handle () {}
}

module.exports = BidPriceSmallerException;
