'use strict';

const { rule } = require('indicative');

const BaseValidator = use('App/Validators/BaseValidator');
const Moment = use('App/Utils/Moment');
const LotModel = use('App/Models/Lot');

class Lot extends BaseValidator {
  get rules () {
    // eslint-disable-next-line camelcase
    const { start_time } = this.ctx.request.post();
    const currentTime = Moment().format(LotModel.formatTimeType);
    const startTime = Moment(start_time).format(LotModel.formatTimeType);

    return {
      title: 'required|min:5',
      current_price: 'required',
      estimated_price: 'required',
      start_time: [
        rule('required'),
        rule('dateFormat', LotModel.formatTimeType),
        rule('after', currentTime),
      ],
      end_time: [
        rule('required'),
        rule('dateFormat', LotModel.formatTimeType),
        rule('after', startTime),
      ],
    };
  }

  get sanitizationRules () {
    return {
      current_price: 'toFloat',
      estimated_price: 'toFloat',
    };
  }
}

module.exports = Lot;
