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

    return response.send(new ResponseDto.Success(
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

    return response.send(new ResponseDto.Success(
      filteredLots,
    ));
  }

  async store ({ request, response, auth }) {
    const lotData = request.all();
    const user = await auth.getUser();

    if (lotData.end_time <= lotData.start_time) {
      return response.status(422).send(new ResponseDto.Error(
        'EndTimeMustMoreStartTime',
      ));
    }

    const lot = new Lot();
    lot.user_id = user.id;
    lot.fill(lotData);

    if (lotData.image) {
      lot.fillImage(lotData.image);
    }

    await lot.save();

    return response.send(new ResponseDto.Success(
      lot,
    ));
  }

  async show ({ response, params, auth }) {
    const user = await auth.getUser();
    const lot = await this.repository.findOrFail(params.id, user);

    return response.send(new ResponseDto.Success(
      lot,
    ));
  }

  async destroy ({ response, params, auth }) {
    const user = await auth.getUser();
    const lot = await this.repository.findOrFail(params.id, user);

    if (!lot.isPending()) {
      return response.status(403).send(new ResponseDto.Error(
        'LotActiveCannotDelete',
        'Lot delete only in PENDING_STATUS status',
      ));
    }

    await lot.delete();

    return response.send(new ResponseDto.Success(
      null,
    ));
  }

  async update ({
    request, response, params, auth,
  }) {
    const { id } = params;
    const user = await auth.getUser();
    const lot = await this.repository.findOrFail(id, user);
    const { image, ...lotRequest } = request.post();

    if (!lot.isPending()) {
      return response.status(403).send(new ResponseDto.Error(
        'LotActiveCannotDelete',
        'Lot delete only in PENDING_STATUS status',
      ));
    }

    lot.merge(lotRequest);

    if (image) {
      await lot.removeImage();
      lot.fillImage(image);
    }

    await lot.save();

    return response.send(new ResponseDto.Success(
      lot,
    ));
  }
}

module.exports = LotController;
