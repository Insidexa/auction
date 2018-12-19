'use strict';

const Config = use('Config');
const Mail = use('Mail');

class OrderListener {
  constructor () {
    this.from = Config.get('mail.from');
    this.frontUrl = Config.get('app.frontUrl');
  }

  async onWinner ({ user, bid, lot }) {
    const emailData = {
      bid,
      lot,
      frontUrl: this.frontUrl,
    };

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
}

module.exports = OrderListener;
