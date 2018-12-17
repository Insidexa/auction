'use strict';

const { ServiceProvider, ioc } = require('@adonisjs/fold');

class AppServiceProvider extends ServiceProvider {
  register () {
    ioc.bind('FSService', (app) => {
      const FSService = app.use('App/Services/FSService');

      return new FSService();
    });

    ioc.bind('JobService', (app) => {
      const JobService = app.use('App/Services/JobService');
      const Queue = app.use('Kue/Queue');

      return new JobService(Queue);
    });

    ioc.bind('LotJobService', (app) => {
      const LotJobService = app.use('App/Services/LotJobService');
      const JobService = app.use('JobService');

      return new LotJobService(JobService);
    });
  }
}

module.exports = AppServiceProvider;
