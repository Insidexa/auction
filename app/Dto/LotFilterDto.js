const ALL = 'all';

const CREATED = 'created';

const PARTICIPATION = 'participation';

class LotFilterDto {
  constructor (page = 1, type = ALL) {
    this.page = page;
    this.type = type;
  }
}

module.exports = LotFilterDto;
module.exports.ALL = ALL;
module.exports.CREATED = CREATED;
module.exports.PARTICIPATION = PARTICIPATION;
