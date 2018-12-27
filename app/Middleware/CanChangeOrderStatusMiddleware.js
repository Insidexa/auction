'use strict';

/* eslint-disable no-case-declarations */

const Order = use('App/Models/Order');
const ResponseDto = use('App/Dto/ResponseDto');

class CanChangeOrderStatusMiddleware {
  async handle ({ params, auth, response }, next, properties) {
    const [type, statusNeededStr] = properties;
    const orderId = params.id;
    const { user } = auth;
    const order = await Order.findOrFail(orderId);
    const statusNeeded = parseInt(statusNeededStr, 10);
    let userId = null;

    if (order.status !== statusNeeded) {
      return response.status(403).send(ResponseDto.error(
        'OrderStatusDenied',
      ));
    }

    // eslint-disable-next-line default-case
    switch (type) {
      case Order.CUSTOMER:
        userId = order.user_id;
        break;

      case Order.SELLER:
        const lot = await order.lot().fetch();
        userId = lot.user_id;
        break;
    }

    if (userId === user.id) {
      return await next();
    }

    return response.status(403).send(ResponseDto.error(
      'OrderAccessDenied',
    ));
  }
}

module.exports = CanChangeOrderStatusMiddleware;
