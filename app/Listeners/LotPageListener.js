'use strict';

const Ws = use('Ws');

class LotPageListener {
  onCreateBid (bid) {
    const channel = Ws.getChannel('lot:*');
    const { socket } = channel.topic(`lot:${bid.lot_id}`);
    socket.broadcastToAll('bidsCollection:new', bid);
  }
}

module.exports = LotPageListener;
