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
   * @param { Function } onReceived
   */
  send (data, onReceived) {
    this.transport.send(data, onReceived);
  }
}

module.exports = Notification;
