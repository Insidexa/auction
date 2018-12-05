const { ServiceProvider } = require('@adonisjs/fold');

class ExistsRuleProvider extends ServiceProvider {
  async exists (data, field, message, args, get) {
    const value = get(data, field);

    if (!value) {
      return;
    }

    const [table, column] = args;
    const entity = await this.app.use('Database').table(table).where(column, value).first();

    if (!entity) {
      throw message;
    }
  }

  boot () {
    const validator = use('Validator');
    validator.extend('exists', this.exists.bind(this));
  }
}

module.exports = ExistsRuleProvider;
