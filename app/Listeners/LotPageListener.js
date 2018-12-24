'use strict';

const Ws = use('Ws');

class LotPageListener {
  onCreateBid (bid) {
    const channel = Ws.getChannel('lot:*');
    const topic = channel.topic(`lot:${bid.lot_id}`);
    if (topic) {
      topic.broadcastToAll('bidsCollection:new', bid);
    }
  }
}

module.exports = LotPageListener;
