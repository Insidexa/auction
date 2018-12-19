'use strict';

module.exports = (chance, i, data) => ({
  title: chance.sentence({ words: 5 }),
  description: chance.paragraph(),
  current_price: chance.integer({
    min: 10,
    max: 100,
  }),
  estimated_price: chance.integer({
    min: 100,
    max: 1000,
  }),
  image: data.image ? data.image : null,
  ...data,
});
