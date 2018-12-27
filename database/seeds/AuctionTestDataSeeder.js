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

const Factory = use('Factory');
const Database = use('Database');
const Lot = use('App/Models/Lot');
const Moment = use('App/Utils/Moment');

class AuctionTestDataSeeder {
  async run () {
    await this.cleanupDB();

    const [arrivalTypeFirst] = await this.makeArrivalTypes();

    const password = '12345678';
    const [firstUserData, ...otherUsersData] = this.makeUsersData();
    const userSeller = await Factory.model('App/Models/User').create({
      password,
      ...firstUserData,
    });
    const userCustomer = await Factory.model('App/Models/User').create({
      password,
      email: 'customer@g.com',
      email_confirmed: true,
    });
    for (const userData of otherUsersData) {
      await Factory.model('App/Models/User').create({
        password,
        ...userData,
      });
    }
    const lotsData = this.makeLotsData(userSeller);
    const closedLotData = lotsData.find(lot => lot.status === Lot.CLOSED_STATUS);
    const otherLotsData = lotsData.filter(lot => lot.status !== Lot.CLOSED_STATUS);

    for (const lotData of otherLotsData) {
      await Factory.model('App/Models/Lot').create(lotData);
    }

    const lot = await Factory.model('App/Models/Lot').create(closedLotData);
    const winnerBid = await this.makeBid({
      user_id: userCustomer.id,
      lot_id: lot.id,
      proposed_price: lot.estimated_price,
    });
    await this.makeBid({
      user_id: userCustomer.id,
      lot_id: lot.id,
      proposed_price: lot.estimated_price / 2,
    });

    await Factory.model('App/Models/Order').create({
      user_id: userCustomer.id,
      lot_id: lot.id,
      bid_id: winnerBid.id,
      arrival_type_id: arrivalTypeFirst.id,
    });
  }

  async cleanupDB () {
    await Database.table('orders').delete();
    await Database.table('arrival_types').delete();
    await Database.table('delivery_types').delete();

    await Database.table('tokens').delete();
    await Database.table('bids').delete();
    await Database.table('lots').delete();
    await Database.table('users').delete();
  }

  async makeArrivalTypes () {
    const companyType = await Factory.model('App/Models/DeliveryType').create({
      name: 'company',
    });
    const pickupType = await Factory.model('App/Models/DeliveryType').create({
      name: 'pickup',
    });

    const companiesNames = this.arrivalCompanies();
    const arrivalTypes = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const company of companiesNames) {
      arrivalTypes.push(
        Factory.model('App/Models/ArrivalType').create({
          name: company,
          delivery_type_id: companyType.id,
        }),
      );
    }

    const pickup = Factory.model('App/Models/ArrivalType').create({
      name: 'Pickup',
      delivery_type_id: pickupType.id,
    });

    arrivalTypes.push(pickup);

    return Promise.all(arrivalTypes);
  }

  arrivalCompanies () {
    return [
      'DHL Express',
      'United States Postal Service',
      'Royal Mail',
    ];
  }

  async makeBid (data) {
    return await Factory.model('App/Models/Bid').create({
      ...data,
    });
  }

  makeUsersData () {
    return [
      {
        email: 'seller@g.com',
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
