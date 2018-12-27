'use strict';

const Event = use('Event');

Event.on('user::created', 'UserListener.created');
Event.on('user::passwordReset', 'UserListener.passwordReset');

Event.on('order::onWinner', 'OrderListener.onWinner');
Event.on('order::onCreate', 'OrderListener.onCreate');
Event.on('order::onSellerExecute', 'OrderListener.onSellerExecute');
Event.on('order::onCustomerReceive', 'OrderListener.onCustomerReceive');
Event.on('lotPage::onCreateBid', 'LotPageListener.onCreateBid');
