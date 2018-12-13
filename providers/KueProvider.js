'use strict';

const { ServiceProvider } = require('@adonisjs/fold');

class KueProvider extends ServiceProvider {
  register () {
    const Kue = this.app.use('App/Utils/Kue');
    this.app.singleton('Kue/Queue', () => Kue.createQueue());
  }
}

module.exports = KueProvider;
