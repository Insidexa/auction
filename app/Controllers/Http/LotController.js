'use strict';

const { ioc } = require('@adonisjs/fold');

const LotFilterDto = use('App/Dto/LotFilterDto');
const ResponseDto = use('App/Dto/ResponseDto');
const Lot = use('App/Models/Lot');

class LotController {
  constructor () {
    this.repository = ioc.use('App/Repositories/LotRepository');
  }

  async index ({ response, params }) {
    const { type, page } = params;
    const filteredLots = await this.repository.all(
      new LotFilterDto(page, type),
    );

    return response.send(ResponseDto.success(
      filteredLots,
    ));
  }

  async my ({ request, response, auth }) {
    const { type, page } = request.all();
    const user = await auth.getUser();
    const filteredLots = await this.repository.filter(
      new LotFilterDto(page, type),
      user,
    );

    return response.send(ResponseDto.success(
      filteredLots,
    ));
  }

  async store ({ request, response }) {
    const lotRequest = request.all();

    if (lotRequest.end_time <= lotRequest.start_time) {
      return response.status(422).send(new ResponseDto.Error(
        'EndTimeMustMoreStartTime',
      ));
    }

    const lot = new Lot();
    lot.fill(lotRequest);

    if (lotRequest.image) {
      lot.fillImage(lotRequest.image);
    }

    await lot.save();

    return response.send(ResponseDto.success(
      lot,
    ));
  }

  async show ({ response, params, auth }) {
    const user = await auth.getUser();
    const lot = await this.repository.findOrFail(params.id, user);

    if (!lot) {
      return response.status(404).send(new ResponseDto.Error(
        'ModelNotFoundException',
        'Lot not found or access to lots other users',
      ));
    }

    return response.send(ResponseDto.success(
      lot,
    ));
  }

  async destroy ({ response, params, auth }) {
    const user = await auth.getUser();
    const lot = await this.repository.findOrFail(params.id, user);

    if (!lot) {
      return response.status(404).send(new ResponseDto.Error(
        'ModelNotFoundException',
        'Lot not found or access to lots other users',
      ));
    }

    if (lot.status !== Lot.PENDING_STATUS) {
      return response.status(403).send(new ResponseDto.Error(
        'LotActiveCannotDelete',
        'Lot delete only in PENDING_STATUS status',
      ));
    }

    await lot.delete();

    return response.send(ResponseDto.success(
      null,
    ));
  }
}

module.exports = LotController;
