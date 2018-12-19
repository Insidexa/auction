'use strict';

const Config = use('Config');
const Mail = use('Mail');

class LotListener {
  constructor () {
    this.from = Config.get('mail.from');
  }

  async onBidWinner ({ bid, lot }) {
    const user = await lot.user().fetch();
    await Mail.send('emails.lot-closed', { user, lot, bid }, (message) => {
      message.from(this.from);
      message.subject('Lot closed');
      message.to(user.email);
    });
  }
}

module.exports = LotListener;
