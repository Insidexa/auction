'use strict';

const Config = use('Config');
const Mail = use('Mail');
const LotJobService = use('LotJobService');
const JobService = use('JobService');

class OrderListener {
  constructor () {
    this.from = Config.get('mail.from');
  }

  async onWinner ({ user, bid, lot }) {
    const emailData = this.getMailData({ bid, lot });
    const { jobEndId } = await LotJobService.getLotJobsIds(lot.id);
    await JobService.complete(jobEndId);

    await Mail.send('emails.bid-winner', { ...emailData, user }, (message) => {
      message.from(this.from);
      message.subject('You are winner !');
      message.to(user.email);
    });

    const lotUser = await lot.user().fetch();
    await Mail.send('emails.lot-closed', { user: lotUser, ...emailData }, (message) => {
      message.from(this.from);
      message.subject('Lot closed');
      message.to(lotUser.email);
    });
  }

  async onCreate ({ lot }) {
    const user = await lot.user().fetch();
    await Mail.send('emails.order.created', this.getMailData({ lot, user }), (message) => {
      message.from(this.from);
      message.subject(`Execute order (${lot.title})`);
      message.to(user.email);
    });
  }

  async onSellerExecute ({ order, lot }) {
    const user = await order.user().fetch();
    await Mail.send('emails.order.executed', this.getMailData({ lot, user }), (message) => {
      message.from(this.from);
      message.subject(`Seller executed order (${lot.title})`);
      message.to(user.email);
    });
  }

  async onCustomerReceive ({ order, lot }) {
    const userCustomer = await order.user().fetch();
    const userSeller = await lot.user().fetch();
    await Mail.send('emails.order.received-customer', this.getMailData({
      lot,
      user: userCustomer,
    }), (message) => {
      message.from(this.from);
      message.subject(`You received order (${lot.title})`);
      message.to(userCustomer.email);
    });
    await Mail.send('emails.order.received-seller', this.getMailData({
      lot,
      user: userSeller,
    }), (message) => {
      message.from(this.from);
      message.subject(`Customer ${userCustomer.first_name} received order (${lot.title})`);
      message.to(userSeller.email);
    });
  }

  getMailData (data) {
    return {
      frontUrl: Config.get('app.frontUrl'),
      ...data,
    };
  }
}

module.exports = OrderListener;
