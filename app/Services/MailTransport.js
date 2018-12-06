'use strict';

const { ioc } = require('@adonisjs/fold');
const nodemailer = require('nodemailer');

const Logger = use('Logger');

class MailTransport {
  constructor ({ email, password }) {
    this.instance = nodemailer.createTransport(
      `smtps://${email}:${password}@smtp.gmail.com`,
    );
  }

  /**
   *
   * @param { NotificationDto } data
   * @param { Function } onReceived
   */
  send (data, onReceived) {
    const config = ioc.use('Adonis/Src/Config');
    this.instance.sendMail({
      from: config.get('mail.sender'), // sender address
      to: data.to, // list of receivers
      subject: data.subject, // Subject line
      html: data.body, // text/plain body
    }, (error, info) => {
      if (error) {
        Logger.alert('Message not received', {
          error,
          data,
        });
      }

      if (onReceived) {
        onReceived(info);
      }
    });
  }
}

module.exports = MailTransport;
