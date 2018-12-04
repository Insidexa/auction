'use strict';

const { ioc } = require('@adonisjs/fold');

class SignUpController {
  constructor () {
    this.notification = ioc.use('App/Notification');
  }

  async signup ({ request, response }) {
    const all = request.all();
    const User = use('App/Models/User');
    const user = new User();
    user.fill(all);
    await user.save();

    return response.status(200).send({
      data: user,
    });
  }
}

module.exports = SignUpController;
