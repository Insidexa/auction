'use strict';

const Database = use('Database');
const Config = use('Config');
const Mail = use('Mail');
const User = use('App/Models/User');
const Token = use('App/Models/Token');
const ResponseDto = use('App/Dto/ResponseDto');

class SignInController {
  async passwordRecovery ({ request, response }) {
    const { email } = request.post();
    const user = await User.findBy('email', email);

    if (!user.email_confirmed) {
      return response.status(401).send(ResponseDto.error(
        'AccountNotConfirmed',
      ));
    }

    const token = await Token.makeToken(user, Token.PASSWORD_TOKEN);

    Mail.send('emails.password-reset', { token: token.token }, (message) => {
      message.from(Config.get('mail.from'));
      message.subject('Confirmation');
      message.to(user.email);
    });

    return response.send(ResponseDto.success(
      null,
    ));
  }

  async passwordUpdate ({ request, response, params }) {
    const { recoveryToken } = params;
    const { password } = request.post();
    const token = await Token.query()
      .where('token', recoveryToken)
      .active()
      .passwordToken()
      .firstOrFail();
    const user = await token.user().fetch();
    user.password = password;

    await Database.transaction(async () => {
      user.save();
      token.delete();
    });

    return response.send(ResponseDto.success(
      user,
    ));
  }

  async signin ({ request, response, auth }) {
    const { email, password } = request.post();
    const user = await User.findBy('email', email);

    if (!user.email_confirmed) {
      return response.status(401).send(ResponseDto.error(
        'AccountNotConfirmed',
      ));
    }

    const token = await auth.attempt(email, password);

    return response
      .header('JWTToken', token.token)
      .send(ResponseDto.success(user));
  }
}

module.exports = SignInController;
