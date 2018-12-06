'use strict';

const { ioc } = require('@adonisjs/fold');

const Mailer = use('Mail');

class MailTransport {
  /**
   *
   * @param { NotificationDto } data
   */
  async send (data) {
    const config = ioc.use('Adonis/Src/Config');
    const from = config.get('mail.from');

    await Mailer.raw(data.body, (message) => {
      message.from(from);
      message.subject(data.subject);
      message.to(data.to);
    });
  }
}

module.exports = MailTransport;
