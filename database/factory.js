'use strict';

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');
const UserFactory = require('./factories/UserFactory');
const LotFactory = require('./factories/LotFactory');
const BidFactory = require('./factories/BidFactory');
const OrderFactory = require('./factories/OrderFactory');
const DeliveryTypeFactory = require('./factories/DeliveryTypeFactory');
const ArrivalTypeFactory = require('./factories/ArrivalTypeFactory');

Factory.blueprint('App/Models/User', UserFactory);

Factory.blueprint('App/Models/Lot', LotFactory);

Factory.blueprint('App/Models/Bid', BidFactory);

Factory.blueprint('App/Models/Order', OrderFactory);

Factory.blueprint('App/Models/DeliveryType', DeliveryTypeFactory);

Factory.blueprint('App/Models/ArrivalType', ArrivalTypeFactory);
