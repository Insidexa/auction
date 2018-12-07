'use strict';

class Lot {
  get rules () {
    return {
      title: 'required|min:5',
      current_price: 'required|min:0',
      estimated_price: 'required|min:0',
      start_time: 'required|date',
      end_time: 'required|date',
    };
  }

  get sanitizationRules () {
    return {
      start_time: 'toDate',
      end_time: 'toDate',
    };
  }
}

module.exports = Lot;
