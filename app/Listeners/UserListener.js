'use strict';

const Config = use('Config');
const Mail = use('Mail');

class UserListener {
  constructor () {
    this.from = Config.get('mail.from');
  }

  async created ({ user, token }) {
    Mail.send('emails.user-confirmation', { user, token }, (message) => {
      message.from(this.from);
      message.subject('Confirmation');
      message.to(user.email);
    });
  }

  async passwordReset ({ user, token }) {
    Mail.send('emails.password-reset', { user, token }, (message) => {
      message.from(this.from);
      message.subject('Password recovery');
      message.to(user.email);
    });
  }
}

module.exports = UserListener;
