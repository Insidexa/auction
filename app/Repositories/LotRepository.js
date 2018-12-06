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

  /**
   * @param {LotFilterDto} filter
   * @param {User} user
   */
  async filter (filter, user) {
    const query = this.filterByType(this.query, filter, user);
    const lots = await query.paginate(filter.page, this.perPage);

    lots.rows = this.checkLotIsCurrentUser(lots.rows, user);

    return lots;
  }

  checkLotIsCurrentUser (lots, user) {
    return lots.map((lot) => {
      if (lot.user_id === user.id) {
        lot.self = true;
      }

      return lot;
    });
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
