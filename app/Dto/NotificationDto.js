'use strict';

class NotificationDto {
  constructor (to, subject, body) {
    this.to = to;
    this.subject = subject;
    this.body = body;
  }
}

module.exports.NotificationDto = NotificationDto;
