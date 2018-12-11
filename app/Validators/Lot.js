'use strict';

class Lot {
  get rules () {
    return {
      title: 'required|min:5',
      current_price: 'required',
      estimated_price: 'required',
      start_time: 'required|date|lotCheckStartDate',
      end_time: 'required|date|lotCheckEndDate:start_time',
    };
  }

  get sanitizationRules () {
    return {
      start_time: 'toDate',
      end_time: 'toDate',
    };
  }

  get validateAll () {
    return true;
  }
}

module.exports = Lot;
