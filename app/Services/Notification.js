'use strict';

class Notification {
  constructor (Transport) {
    this.transport = Transport;
  }

  static factory (NotificationTransport) {
    return new Notification(NotificationTransport);
  }

  /**
   *
   * @param { NotificationDto } data
   */
  send (data) {
    this.transport.send(data);
  }
}

module.exports = Notification;
