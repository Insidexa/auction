'use strict';

const LotFilterDto = use('App/Dto/LotFilterDto');
const ResponseDto = use('App/Dto/ResponseDto');
const Lot = use('App/Models/Lot');
const { removeIfExists, saveImageFromBase64 } = use('App/Utils/FS');

class LotController {
  async index ({ response, params }) {
    const { page } = params;
    const filteredLots = await Lot.query()
      .inProcess()
      .paginate(page, 10);

    return response.send(ResponseDto.success(
      filteredLots,
    ));
  }

  async my ({ params, response, auth }) {
    const { type, page } = params;
    const user = await auth.getUser();
    const filteredLots = await Lot.query()
      .filterByType(
        new LotFilterDto(page, type),
        user,
      )
      .paginate(page, 10);

    return response.send(ResponseDto.success(
      filteredLots,
    ));
  }

  async store ({ request, response, auth }) {
    const lotRequest = this.filterLotFields(request);
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
    const lot = await Lot.query()
      .findLotByUser(params.id, user)
      .firstOrFail();

    return response.send(ResponseDto.success(
      lot,
    ));
  }

  async destroy ({ response, params, auth }) {
    const user = await auth.getUser();
    const lot = await Lot.query()
      .findLotByUser(params.id, user)
      .firstOrFail();

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
    const lot = await Lot.query()
      .findLotByUser(params.id, user)
      .firstOrFail();
    const { image, ...lotRequest } = this.filterLotFields(request);

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

  filterLotFields (request) {
    return request.only([
      'title',
      'description',
      'current_price',
      'estimated_price',
      'start_time',
      'end_time',
      'image',
    ]);
  }
}

module.exports = LotController;
