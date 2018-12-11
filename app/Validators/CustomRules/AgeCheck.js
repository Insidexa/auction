'use strict';

// Check types
const LESS = 'less';

const MORE = 'more';

const EQUAL = 'equal';

// work only with async, indicative lib need promise used
async function ageCheck (data, field, message, args, get) {
  const birthday = get(data, field);
  const currentYear = new Date().getFullYear();
  const userYear = currentYear - new Date(birthday).getFullYear();
  const [type, ageCheckString] = args;
  const rangeAge = parseInt(ageCheckString, 0);

  switch (type) {
    case LESS:
      if (userYear >= rangeAge) {
        throw new Error(`ageCheck validation failed on ${field}. Must be less than ${rangeAge}`);
      }

      break;

    case MORE:
      if (userYear <= rangeAge) {
        throw new Error(`ageCheck validation failed on ${field}. Must be more than ${rangeAge}`);
      }

      break;

    case EQUAL:
      if (userYear !== rangeAge) {
        throw new Error(`ageCheck validation failed on ${field}. Must be equal to ${rangeAge}`);
      }

      break;

    default:
      throw Error(`Type ${type} check age not defined. Use [ ${MORE} | ${LESS} | ${EQUAL} ]`);
  }
}

module.exports = ageCheck;
