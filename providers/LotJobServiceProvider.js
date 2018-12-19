'use strict';

const { ServiceProvider } = require('@adonisjs/fold');

class JobServiceProvider extends ServiceProvider {
  register () {
    this.app.singleton('LotJobService', (app) => {
      const LotJobService = app.use('App/Services/LotJobService');
      const JobService = app.use('JobService');

      return new LotJobService(JobService);
    });
  }
}

module.exports = JobServiceProvider;
