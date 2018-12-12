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
const Lot = use('App/Models/Lot');
const Moment = use('App/Utils/Moment');

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
      await Factory.model('App/Models/User').create({
        password: '12345678',
        email: 'not-confirmed@g.com',
        email_confirmed: false,
      }),
    ];
  }

  async makeLots (user) {
    const lotPrices = {
      current_price: 100,
      estimated_price: 1000.01,
    };

    return [
      await this.makePendingLot(user, lotPrices),
      await this.makeProcessLot(user, lotPrices),
      await this.makeClosedLot(user, lotPrices),
    ];
  }

  async makePendingLot (user, lotPrices) {
    const startDate = Moment();
    startDate.add(1, 'minutes');
    const endDate = Moment(startDate);
    endDate.add(1, 'minutes');

    await Factory.model('App/Models/Lot').create({
      user_id: user.id,
      status: Lot.PENDING_STATUS,
      start_time: startDate,
      end_time: endDate,
      ...lotPrices,
    });
  }

  async makeProcessLot (user, lotPrices) {
    const startDate = Moment();
    startDate.subtract(1, 'minutes');
    const endDate = Moment();
    endDate.add(2, 'minutes');

    await Factory.model('App/Models/Lot').create({
      user_id: user.id,
      status: Lot.IN_PROCESS_STATUS,
      start_time: startDate,
      end_time: endDate,
      ...lotPrices,
    });
  }

  async makeClosedLot (user, lotPrices) {
    const startDate = Moment();
    startDate.subtract(3, 'hours');
    const endDate = Moment();
    endDate.add(1, 'hours');

    await Factory.model('App/Models/Lot').create({
      user_id: user.id,
      status: Lot.CLOSED_STATUS,
      start_time: startDate,
      end_time: endDate,
      ...lotPrices,
    });
  }
}

module.exports = AuctionTestDataSeeder;
