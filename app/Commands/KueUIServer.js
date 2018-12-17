'use strict';

const { Command } = require('@adonisjs/ace');

const Kue = use('App/Utils/Kue');

class KueUIServer extends Command {
  static get signature () {
    return 'kue:ui:server';
  }

  static get description () {
    return 'Run Kue UI';
  }

  async handle () {
    Kue.app.listen(3000);
  }
}

module.exports = KueUIServer;
