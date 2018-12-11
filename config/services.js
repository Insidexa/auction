'use strict';

const { ioc } = require('@adonisjs/fold');
const LotRepository = require('../app/Repositories/LotRepository');

ioc.bind('App/Repositories/LotRepository', (app) => {
  const Lot = app.use('App/Models/Lot');

  return new LotRepository(Lot);
});
