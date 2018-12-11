'use strict';

const { ALL, CREATED, PARTICIPATION } = use('App/Dto/LotFilterDto');

class LotRepository {
  constructor (Lot) {
    this.query = Lot.query();
    this.perPage = 10;
  }

  async all (filter) {
    return await this.query
      .inProcess()
      .paginate(filter.page, this.perPage);
  }

  async findOrFail (id, user) {
    return await this.query
      .where('id', id)
      .where('user_id', user.id)
      .firstOrFail();
  }

  /**
   * @param {LotFilterDto} filter
   * @param {User} user
   */
  async filter (filter, user) {
    const query = this.filterByType(this.query, filter, user);
    return await query.paginate(filter.page, this.perPage);
  }

  filterByType (query, filter, user) {
    switch (filter.type) {
      case ALL:
        return query.inProcess();

      case CREATED:
        return query.where('user_id', user.id);

      case PARTICIPATION:
        // TODO: get user binds with lot
        return query.whereNot('user_id', user.id);

      default:
        return query;
    }
  }
}

module.exports = LotRepository;
