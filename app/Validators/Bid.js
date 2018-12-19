'use strict';

const BaseValidator = use('App/Validators/BaseValidator');

class Bid extends BaseValidator {
  get rules () {
    return {
      proposed_price: 'required|number|above:0',
      lot_id: 'required',
    };
  }

  get sanitizationRules () {
    return {
      proposed_price: 'toFloat',
    };
  }
}

module.exports = Bid;
