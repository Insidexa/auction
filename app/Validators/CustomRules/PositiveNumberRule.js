'use strict';

async function positiveNumberRule (data, field, message, args, get) {
  const value = get(data, field);
  const number = Number(value);
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(number)) {
    return;
  }

  if (number <= 0) {
    throw message;
  }
}

module.exports = positiveNumberRule;
