'use strict';

const ResponseDto = use('App/Dto/ResponseDto');
const Lot = use('App/Models/Lot');
const LotJobService = use('LotJobService');

class LotController {
  async all ({ response, request }) {
    const { page, perPage } = request.all();
    const filteredLots = await Lot.query()
      .inProcess()
      .paginate(page, perPage);

    return response.send(ResponseDto.success(
      filteredLots.rows,
      filteredLots.pages,
    ));
  }

  async self ({ request, response, auth }) {
    const { type, page, perPage } = request.all();
    const { user } = auth;
    const filteredLots = await Lot.query()
      .filterByType(type, user)
      .paginate(page, perPage);

    return response.send(ResponseDto.success(
      filteredLots.rows,
      filteredLots.pages,
    ));
  }

  async store ({ request, response, auth }) {
    const lotRequest = this.filterLotFields(request);
    const { user } = auth;
    const lot = new Lot();
    lot.fill(lotRequest);

    await user.lots().save(lot);
    LotJobService.runJobs(lot);

    return response.send(ResponseDto.success(
      lot,
    ));
  }

  async show ({ response, params, auth }) {
    const { user } = auth;
    const lot = await Lot.query()
      .with('bids', (builder) => {
        builder
          .orderBy('proposed_price', 'desc')
          .orderBy('created_at', 'desc');
      })
      .where('id', params.id)
      .firstOrFail();

    const isWinner = await lot.userIsWinner(user);
    const lotResponse = lot.toJSON();

    if (!isWinner) {
      delete lotResponse.order;
    }

    return response.send(ResponseDto.success(
      {
        ...lotResponse,
        isWinner,
      },
    ));
  }

  async destroy ({ response, params, auth }) {
    const { user } = auth;
    const lot = await Lot.findByOrFail({ id: params.id, user_id: user.id });

    if (!lot.isPending()) {
      return response.status(403).send(ResponseDto.error(
        'LotActiveCannotDelete',
        'Lot delete only in PENDING_STATUS status',
      ));
    }

    await lot.delete();
    LotJobService.removeJobsIfExists(lot.id);

    return response.status(204).send();
  }

  async update ({
    request, response, params, auth,
  }) {
    const { user } = auth;
    const lot = await Lot.findByOrFail({ id: params.id, user_id: user.id });
    const lotRequest = this.filterLotFields(request);

    if (!lot.isPending()) {
      return response.status(403).send(ResponseDto.error(
        'LotActiveCannotUpdate',
        'Lot delete only in PENDING_STATUS status',
      ));
    }

    lot.merge(lotRequest);

    await lot.save();
    LotJobService.removeJobsIfExists(lot.id);
    LotJobService.runJobs(lot);

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
