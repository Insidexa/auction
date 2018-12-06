'use strict';

const { ioc } = require('@adonisjs/fold');

const LotFilterDto = use('App/Dto/LotFilterDto');
const ResponseDto = use('App/Dto/ResponseDto');
const Lot = use('App/Models/Lot');

class LotController {
  constructor () {
    this.repository = ioc.use('App/Repositories/LotRepository');
  }

  async index ({ response, params, auth }) {
    const { type, page } = params;
    const user = await auth.getUser();
    const filteredLots = await this.repository.filter(
      new LotFilterDto(page, type),
      user,
    );

    return response.send(new ResponseDto.Success(
      filteredLots,
    ));
  }

  async create ({ request, response }) {
    const lotData = request.all();

    if (lotData.end_time <= lotData.start_time) {
      return response.status(422).send(new ResponseDto.Error(
        'EndTimeMustMoreStartTime',
      ));
    }

    const lot = new Lot();
    lot.fill(lotData);

    if (lotData.image) {
      lot.fillImage(lotData.image);
    }

    // lot.save();
  }
}

module.exports = LotController;