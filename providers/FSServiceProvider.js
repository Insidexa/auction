'use strict';

const { ServiceProvider } = require('@adonisjs/fold');

class AppServiceProvider extends ServiceProvider {
  register () {
    this.app.singleton('FSService', (app) => {
      const FSService = app.use('App/Services/FSService');

      return new FSService();
    });
  }
}

module.exports = AppServiceProvider;
