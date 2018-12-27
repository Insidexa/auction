'use strict';

module.exports = (chance, i, data) => ({
  arrival_location: chance.address(),
  status: 0,
  ...data,
});
