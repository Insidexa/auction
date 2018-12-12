'use strict';

const LotFilterDto = use('App/Dto/LotFilterDto');
const ResponseDto = use('App/Dto/ResponseDto');
const Lot = use('App/Models/Lot');
const LotRepository = use('App/Repositories/LotRepository');
const { removeIfExists, saveImageFromBase64 } = use('App/Utils/FS');

class LotController {
  constructor () {
    this.repository = new LotRepository();
  }

  async index ({ response, params }) {
    const { page } = params;
    const filteredLots = await this.repository.all(
      new LotFilterDto(page),
    );

    return response.send(ResponseDto.success(
      filteredLots,
    ));
  }

  async my ({ params, response, auth }) {
    const { type, page } = params;
    const user = await auth.getUser();
    const filteredLots = await this.repository.filter(
      new LotFilterDto(page, type),
      user,
    );

    return response.send(ResponseDto.success(
      filteredLots,
    ));
  }

  async store ({ request, response, auth }) {
    const lotRequest = request.post();
    const user = await auth.getUser();
    const lot = new Lot();
    lot.fill(lotRequest);

    if (lotRequest.image) {
      lot.image = saveImageFromBase64(lotRequest.image);
    }

    lot.user_id = user.id;
    await lot.save();

    return response.send(ResponseDto.success(
      lot,
    ));
  }

  async show ({ response, params, auth }) {
    const user = await auth.getUser();
    const lot = await this.repository.findOrFail(params.id, user);

    return response.send(ResponseDto.success(
      lot,
    ));
  }

  async destroy ({ response, params, auth }) {
    const user = await auth.getUser();
    const lot = await this.repository.findOrFail(params.id, user);

    if (!lot.isPending()) {
      return response.status(403).send(ResponseDto.error(
        'LotActiveCannotDelete',
        'Lot delete only in PENDING_STATUS status',
      ));
    }

    await removeIfExists(lot.image);
    await lot.delete();

    return response.send(ResponseDto.success(
      null,
    ));
  }

  async update ({
    request, response, params, auth,
  }) {
    const user = await auth.getUser();
    const lot = await this.repository.findOrFail(params.id, user);
    const { image, ...lotRequest } = request.post();

    if (!lot.isPending()) {
      return response.status(403).send(ResponseDto.error(
        'LotActiveCannotDelete',
        'Lot delete only in PENDING_STATUS status',
      ));
    }

    lot.merge(lotRequest);

    if (image) {
      await removeIfExists(lot.image);
      lot.image = saveImageFromBase64(image);
    }

    await lot.save();

    return response.send(ResponseDto.success(
      lot,
    ));
  }
}

module.exports = LotController;
