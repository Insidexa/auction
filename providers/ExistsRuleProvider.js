const { ServiceProvider } = require('@adonisjs/fold');

const LESS = 'less';

const MORE = 'more';

const EQUAL = 'equal';

class AgeCheckRuleProvider extends ServiceProvider {
  /**
   * not work:
   *  - https://adonisjs.com/docs/4.0/validator#_application_specific
   *  - https://adonisjs.com/docs/4.0/validator#_via_provider
   * work: https://github.com/poppinss/indicative/blob/develop/src/validations/required.js
   * @param data
   * @param field
   * @param message
   * @param args
   * @param get
   * @returns {Promise<any>}
   */
  ageCheck (data, field, message, args, get) {
    return new Promise((resolve) => {
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
          resolve();

          break;

        case MORE:
          if (userYear <= rangeAge) {
            throw new Error(`ageCheck validation failed on ${field}. Must be more than ${rangeAge}`);
          }

          resolve();

          break;

        case EQUAL:
          if (userYear !== rangeAge) {
            throw new Error(`ageCheck validation failed on ${field}. Must be equal to ${rangeAge}`);
          }

          resolve();

          break;

        default:
          throw Error(`Type ${type} check age not defined. Use more or less`);
      }
    });
  }

  boot () {
    const validator = use('Validator');
    validator.extend('ageCheck', this.ageCheck.bind(this));
  }
}

module.exports = AgeCheckRuleProvider;
