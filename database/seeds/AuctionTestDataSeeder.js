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
    this.makeLots(userForLots);
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
    const current = new Date();
    const startTime = new Date();
    startTime.setDate(current.getDate() + 10);
    const endTime = new Date();
    endTime.setDate(startTime.getDate() + 5);
    const inProcessLotDate = new Date();
    inProcessLotDate.setFullYear(2020);

    return [
      await Factory.model('App/Models/Lot').create({
        user_id: user.id,
        status: 0,
        current_price: 10.33,
        estimated_price: 2000.33,
        start_time: startTime,
        end_time: endTime,
      }),
      await Factory.model('App/Models/Lot').create({
        user_id: user.id,
        status: 1,
        current_price: 100,
        estimated_price: 1000.01,
        start_time: new Date(),
        end_time: inProcessLotDate,
      }),
      await Factory.model('App/Models/Lot').create({
        user_id: user.id,
        status: 2,
        current_price: 2000,
        estimated_price: 50000.20,
        start_time: new Date(),
        end_time: endTime,
      }),
    ];
  }
}

module.exports = AuctionTestDataSeeder;
