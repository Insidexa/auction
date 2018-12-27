'use strict';

const { hooks } = require('@adonisjs/ignitor');
const path = require('path');

hooks.after.providersBooted(async () => {
  const Env = use('Env');
  const Helpers = use('Helpers');
  const Validator = use('Validator');
  const Queue = use('Kue/Queue');
  const ToFloat = use('App/Validators/CustomSanitizors/ToFloat');
  const BidPriceRule = use('App/Validators/CustomRules/BidPriceRule');
  const ExistsRule = use('App/Validators/CustomRules/ExistsRule');
  const appType = Env.get('APP_TYPE');

  Validator.extend('bidPrice', BidPriceRule);
  Validator.extend('exists', ExistsRule);
  Validator.sanitizor.toFloat = ToFloat;

  if (Helpers.isAceCommand()) {
    await new Promise((resolve => Queue.shutdown(resolve)));
  }

  if (appType === 'http') {
    // eslint-disable-next-line import/no-dynamic-require
    const { jobs } = require(path.join(Helpers.appRoot(), 'start/app.js')) || {};

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
