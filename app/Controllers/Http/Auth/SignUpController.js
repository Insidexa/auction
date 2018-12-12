'use strict';

const Database = use('Database');
const Config = use('Config');
const Mail = use('Mail');
const Token = use('App/Models/Token');
const User = use('App/Models/User');
const ResponseDto = use('App/Dto/ResponseDto');

class SignUpController {
  async signup ({ request, response }) {
    const userRequest = request.except(['password_confirmation']);
    const user = new User();
    user.fill(userRequest);
    await user.save();
    const token = await Token.makeToken(user, Token.CONFIRMATION_TOKEN);

    Mail.send('emails.user-confirmation', { token: token.token }, (message) => {
      message.from(Config.get('mail.from'));
      message.subject('Confirmation');
      message.to(user.email);
    });

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
}

module.exports = SignUpController;