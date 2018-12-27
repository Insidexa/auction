'use strict';

const Event = use('Event');
const Order = use('App/Models/Order');
const ResponseDto = use('App/Dto/ResponseDto');

class OrderController {
  async show ({ params, auth, response }) {
    const order = await Order
      .query()
      .where('id', params.id)
      .findByRelatedUser(auth.user.id)
      .firstOrFail();

    return response.send(ResponseDto.success(
      order,
    ));
  }

  async update ({
    request, params, response,
  }) {
    const arrivalRequestData = this.filterOrderFields(request);
    const { id } = params;
    const order = await Order.find(id);
    order.merge(arrivalRequestData);
    await order.save();

    const lot = await order.lot().fetch();
    Event.fire('order::onCreate', { order, lot });

    return response.send(ResponseDto.success(
      order,
    ));
  }

  async sellerExecute ({ params, response }) {
    const { id } = params;
    const order = await Order.find(id);
    const lot = await order.lot().fetch();

    order.status = Order.SEND_STATUS;
    await order.save();

    Event.fire('order::onSellerExecute', { order, lot });

    return response.send(ResponseDto.success(
      order,
    ));
  }

  async customerReceive ({ params, response }) {
    const { id } = params;
    const order = await Order.find(id);

    order.status = Order.DELIVERED_STATUS;
    await order.save();

    Event.fire('order::onCustomerReceive', order);

    return response.send(ResponseDto.success(
      order,
    ));
  }

  filterOrderFields (request) {
    return request.only([
      'arrival_location',
      'arrival_type_id',
    ]);
  }
}

module.exports = OrderController;
