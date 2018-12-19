'use strict';

const { ServiceProvider } = require('@adonisjs/fold');

class JobServiceProvider extends ServiceProvider {
  register () {
    this.app.singleton('JobService', (app) => {
      const JobService = app.use('App/Services/JobService');
      const Queue = app.use('Kue/Queue');

      return new JobService(Queue);
    });
  }
}

module.exports = JobServiceProvider;
