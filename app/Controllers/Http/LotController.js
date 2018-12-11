'use strict';

const LotFilterDto = use('App/Dto/LotFilterDto');
const ResponseDto = use('App/Dto/ResponseDto');
const Lot = use('App/Models/Lot');
const LotRepository = use('App/Repositories/LotRepository');

class LotController {
  async index ({ response, params }) {
    const { type, page } = params;
    const filteredLots = await LotRepository.all(
      new LotFilterDto(page, type),
    );

    return response.send(ResponseDto.success(
      filteredLots,
    ));
  }

  async my ({ request, response, auth }) {
    const { type, page } = request.all();
    const user = await auth.getUser();
    const filteredLots = await LotRepository.filter(
      new LotFilterDto(page, type),
      user,
    );

    return response.send(ResponseDto.success(
      filteredLots,
    ));
  }

  async store ({ request, response, auth }) {
    const lotRequest = request.all();
    const user = await auth.getUser();
    const lot = new Lot();
    lot.user_id = user.id;
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
    const lot = await LotRepository.findOrFail(params.id, user);

    return response.send(ResponseDto.success(
      lot,
    ));
  }

  async destroy ({ response, params, auth }) {
    const user = await auth.getUser();
    const lot = await LotRepository.findOrFail(params.id, user);

    if (!lot.isPending()) {
      return response.status(403).send(ResponseDto.error(
        'LotActiveCannotDelete',
        'Lot delete only in PENDING_STATUS status',
      ));
    }

    await lot.delete();

    return response.send(ResponseDto.success(
      null,
    ));
  }

  async update ({
    request, response, params, auth,
  }) {
    const { id } = params;
    const user = await auth.getUser();
    const lot = await LotRepository.findOrFail(id, user);
    const { image, ...lotRequest } = request.post();

    if (!lot.isPending()) {
      return response.status(403).send(ResponseDto.error(
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

    return response.send(ResponseDto.success(
      lot,
    ));
  }
}

module.exports = LotController;
