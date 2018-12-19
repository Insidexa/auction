'use strict';

const { ServiceProvider } = require('@adonisjs/fold');

class KueProvider extends ServiceProvider {
  register () {
    const Kue = this.app.use('App/Utils/Kue');
    const Config = this.app.use('Config');
    const redisConfiguration = Config.get('redis');
    const connectionName = redisConfiguration.connection;
    const redisConfig = redisConfiguration[connectionName];
    const queue = Kue.createQueue({
      redis: redisConfig,
    });
    this.app.singleton('Kue/Queue', () => queue);
  }
}

module.exports = KueProvider;
