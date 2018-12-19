'use strict';

const Config = use('Config');
const Mail = use('Mail');

class BidListener {
  constructor () {
    this.from = Config.get('mail.from');
  }

  async onWinner ({ bid, lot }) {
    const user = await bid.user().fetch();
    await Mail.send('emails.bid-winner', { user, lot, bid }, (message) => {
      message.from(this.from);
      message.subject('You are winner !');
      message.to(user.email);
    });
  }
}

module.exports = BidListener;
