'use strict';

module.exports = (chance, i, data) => ({
  proposed_price: chance.integer({
    min: 100,
    max: 1000,
  }),
  ...data,
});
