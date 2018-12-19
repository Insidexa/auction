'use strict';

const BaseValidator = use('App/Validators/BaseValidator');
const Moment = use('App/Utils/Moment');
const LotModel = use('App/Models/Lot');

class Lot extends BaseValidator {
  get rules () {
    // eslint-disable-next-line camelcase
    const { start_time } = this.ctx.request.post();
    const currentTime = Moment().format(LotModel.formatType());
    const startTime = Moment(start_time).format(LotModel.formatType());

    return {
      title: 'required|min:5',
      current_price: 'required',
      estimated_price: 'required',
      start_time: `required|date|after:${currentTime}`,
      end_time: `required|date|after:${startTime}`,
    };
  }

  get sanitizationRules () {
    return {
      start_time: 'toDate',
      end_time: 'toDate',
      current_price: 'toFloat',
      estimated_price: 'toFloat',
    };
  }
}

module.exports = Lot;
