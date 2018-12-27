'use strict';

const BaseValidator = use('App/Validators/BaseValidator');

class OrderUpdate extends BaseValidator {
  get rules () {
    return {
      arrival_location: 'required',
      arrival_type_id: 'required|integer|exists:arrival_types,id',
    };
  }
}

module.exports = OrderUpdate;
