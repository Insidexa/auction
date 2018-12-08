'use strict';

/*
|--------------------------------------------------------------------------
| AuctionTestDatumSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');
const Database = use('Database');

class AuctionTestDataSeeder {
  async run () {
    await Database.table('tokens').delete();
    await Database.table('orders').delete();
    await Database.table('bids').delete();
    await Database.table('lots').delete();
    await Database.table('users').delete();

    const [userForLots] = await this.makeUsers();
    await this.makeLots(userForLots);
  }

  async makeUsers () {
    return [
      await Factory.model('App/Models/User').create({
        password: '12345678',
        email: 'example1@g.com',
        email_confirmed: true,
      }),
      await Factory.model('App/Models/User').create({
        password: '12345678',
        email: 'receiver@g.com',
        email_confirmed: true,
      }),
    ];
  }

  async makeLots (user) {
    const lotPendingStartDate = new Date();
    lotPendingStartDate.setMinutes(lotPendingStartDate.getMinutes() + 1);
    const lotPendingEndDate = new Date();
    lotPendingEndDate.setMinutes(lotPendingStartDate.getMinutes() + 1);

    const lotProcessStartDate = new Date();
    lotProcessStartDate.setMinutes(lotProcessStartDate.getMinutes() - 1);
    const lotProcessEndDate = new Date();
    lotProcessEndDate.setMinutes(lotProcessStartDate.getMinutes() + 2);

    const lotClosedStartDate = new Date();
    lotClosedStartDate.setHours(lotClosedStartDate.getHours() - 3);
    const lotClosedEndDate = new Date();
    lotClosedEndDate.setHours(lotClosedStartDate.getHours() + 1);

    return [
      await Factory.model('App/Models/Lot').create({
        user_id: user.id,
        status: 0,
        current_price: 10.33,
        estimated_price: 2000.33,
        start_time: lotPendingStartDate,
        end_time: lotPendingEndDate,
      }),
      await Factory.model('App/Models/Lot').create({
        user_id: user.id,
        status: 1,
        current_price: 100,
        estimated_price: 1000.01,
        start_time: lotProcessStartDate,
        end_time: lotProcessEndDate,
      }),
      await Factory.model('App/Models/Lot').create({
        user_id: user.id,
        status: 2,
        current_price: 2000,
        estimated_price: 50000.20,
        start_time: lotClosedStartDate,
        end_time: lotClosedEndDate,
      }),
    ];
  }
}

module.exports = AuctionTestDataSeeder;
