'use strict';

const Event = use('Event');

Event.on('user::created', 'UserListener.created');
Event.on('user::passwordReset', 'UserListener.passwordReset');

Event.on('bid::onWinner', 'BidListener.onWinner');
Event.on('lot::onBidWinner', 'LotListener.onBidWinner');
