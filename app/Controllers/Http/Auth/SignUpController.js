'use strict';

const Database = use('Database');
const Event = use('Event');
const Token = use('App/Models/Token');
const User = use('App/Models/User');
const ResponseDto = use('App/Dto/ResponseDto');

class SignUpController {
  async signup ({ request, response }) {
    const userRequest = this.filterUserFields(request);
    const user = new User();
    user.fill(userRequest);
    await user.save();
    const token = await Token.makeToken(user, Token.CONFIRMATION_TOKEN);

    Event.fire('user::created', { user, token });

    return response.send(ResponseDto.success(
      user,
    ));
  }

  async confirmation ({ params, response }) {
    const { confirmationToken } = params;
    const token = await Token.query()
      .active()
      .confirmToken()
      .where('token', confirmationToken)
      .firstOrFail();

    const user = await token.user().fetch();
    await Database.transaction(async () => {
      user.email_confirmed = true;
      user.save();

      token.delete();
    });

    return response.send(ResponseDto.success(
      user,
    ));
  }

  filterUserFields (request) {
    return request.only([
      'password',
      'email',
      'phone',
      'first_name',
      'lastname',
      'birth_day',
    ]);
  }
}

module.exports = SignUpController;
