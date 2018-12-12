'use strict';

const { ALL, CREATED, PARTICIPATION } = use('App/Dto/LotFilterDto');
const Lot = use('App/Models/Lot');

class LotRepository {
  constructor () {
    this.perPage = 10;
  }

  async all (filter) {
    return await Lot.query()
      .inProcess()
      .paginate(filter.page, this.perPage);
  }

  async findOrFail (id, user) {
    return await Lot.query()
      .where('id', id)
      .where('user_id', user.id)
      .firstOrFail();
  }

  /**
   * @param {LotFilterDto} filter
   * @param {User} user
   */
  async filter (filter, user) {
    const query = this.filterByType(Lot.query(), filter, user);
    return await query.paginate(filter.page, this.perPage);
  }

  filterByType (query, filter, user) {
    switch (filter.type) {
      case ALL:
        // TODO: add other lots
        return query.where('user_id', user.id);

      case CREATED:
        return query.where('user_id', user.id);

      case PARTICIPATION:
        // TODO: add other lots
        return query;

      default:
        return query;
    }
  }
}

module.exports = LotRepository;
