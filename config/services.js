'use strict';

const { ioc } = require('@adonisjs/fold');
const { MailTransport } = require('../app/Services/MailTransport');
const { Notification } = require('../app/Services/Notification');

ioc.bind('App/MailTransport', (app) => {
  const config = app.use('Adonis/Src/Config');
  const email = config.get('mail.login');
  const password = config.get('mail.password');

  return new MailTransport({
    email,
    password,
  });
});

ioc.bind('App/Notification', (app) => {
  const config = app.use('Adonis/Src/Config');
  const defaultTransport = config.get('notification.defaultTransport');
  const transport = app.use(defaultTransport);

  return new Notification(transport);
});
