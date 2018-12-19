'use strict';

const { ServiceProvider } = require('@adonisjs/fold');

class JobServiceProvider extends ServiceProvider {
  register () {
    this.app.singleton('BidWinnerService', (app) => {
      const BidWinnerService = app.use('App/Services/BidWinnerService');

      return new BidWinnerService();
    });
  }
}

module.exports = JobServiceProvider;
