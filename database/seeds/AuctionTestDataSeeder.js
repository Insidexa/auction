'use strict';

/* eslint-disable no-restricted-syntax */

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

    const password = '12345678';
    const [firstUserData, ...otherUsersData] = this.makeUsersData();
    const userForLots = await Factory.model('App/Models/User').create({
      password,
      ...firstUserData,
    });
    for (const userData of otherUsersData) {
      await Factory.model('App/Models/User').create({
        password,
        ...userData,
      });
    }
    const lotsData = this.makeLotsData(userForLots);
    for (const lotData of lotsData) {
      const lot = await Factory.model('App/Models/Lot').create(lotData);
      await this.makeBid({
        user_id: lot.user_id,
        lot_id: lot.id,
      });
      await this.makeBid({
        user_id: lot.user_id,
        lot_id: lot.id,
        proposed_price: lot.estimated_price / 2,
      });
    }
  }

  async makeBid (data) {
    return await Factory.model('App/Models/Bid').create({
      ...data,
    });
  }

  makeUsersData () {
    return [
      {
        email: 'example1@g.com',
        email_confirmed: true,
      },
      {
        email: 'receiver@g.com',
        email_confirmed: true,
      },
      {
        email: 'not-confirmed@g.com',
        email_confirmed: false,
      },
    ];
  }

  makeLotsData (user) {
    const lotPrices = {
      current_price: 100,
      estimated_price: 1000.01,
    };

    const lotsData = [
      this.makePendingLot(user),
      this.makeProcessLot(user),
      this.makeClosedLot(user),
    ];

    return lotsData.map(lotData => ({
      user_id: user.id,
      ...lotPrices,
      ...lotData,
    }));
  }

  makePendingLot () {
    const startDate = Moment();
    startDate.add(1, 'minutes');
    const endDate = Moment(startDate);
    endDate.add(1, 'minutes');

    return {
      status: Lot.PENDING_STATUS,
      start_time: startDate,
      end_time: endDate,
    };
  }

  makeProcessLot () {
    const startDate = Moment();
    startDate.subtract(1, 'minutes');
    const endDate = Moment();
    endDate.add(2, 'minutes');

    return {
      status: Lot.IN_PROCESS_STATUS,
      start_time: startDate,
      end_time: endDate,
    };
  }

  makeClosedLot () {
    const startDate = Moment();
    startDate.subtract(3, 'hours');
    const endDate = Moment();
    endDate.add(1, 'hours');

    return {
      status: Lot.CLOSED_STATUS,
      start_time: startDate,
      end_time: endDate,
    };
  }
}

module.exports = AuctionTestDataSeeder;
