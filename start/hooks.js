'use strict';

const { hooks } = require('@adonisjs/ignitor');
const path = require('path');

hooks.after.providersBooted(() => {
  const Env = use('Env');
  const Helpers = use('Adonis/Src/Helpers');
  const appType = Env.get('APP_TYPE');

  if (appType === 'http') {
    // eslint-disable-next-line import/no-dynamic-require
    const { jobs } = require(path.join(Helpers.appRoot(), 'start/app.js')) || {};
    const Queue = use('Kue/Queue');
    jobs.forEach((jobPath) => {
      const Job = use(jobPath);
      const jobInstance = new Job();

      if (!jobInstance.handle) {
        throw new Error('Implement job method \'handle\'');
      }

      Queue.process(Job.name, (job, done) => {
        jobInstance.handle(job, done);
      });
    });
  }
});
