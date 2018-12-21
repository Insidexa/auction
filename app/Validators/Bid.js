'use strict';

/* eslint-disable camelcase */

const BaseValidator = use('App/Validators/BaseValidator');
const ResponseDto = use('App/Dto/ResponseDto');
const Lot = use('App/Models/Lot');

class Bid extends BaseValidator {
  get rules () {
    return {
      proposed_price: 'required|number|bidPrice',
      lot_id: 'required',
    };
  }

  get sanitizationRules () {
    return {
      proposed_price: 'toFloat',
    };
  }

  async authorize () {
    const { lot_id } = this.ctx.request.post();
    const { id } = this.ctx.auth.user;
    const lot = await Lot.query().inProcess().where('id', lot_id).firstOrFail();
    if (lot.user_id === id) {
      this.ctx.response
        .status(403)
        .send(ResponseDto.error(
          'CannotBuyYourselfLot',
        ));
      return false;
    }
    return true;
  }
}

module.exports = Bid;
