'use strict';

/* eslint-disable camelcase */

const Database = use('Database');
const User = use('App/Models/User');
const Token = use('App/Models/Token');
const ResponseDto = use('App/Dto/ResponseDto');

class SignInController {
  async passwordRecovery ({ request, response }) {
    const { email } = request.post();
    const user = await User.findBy('email', email);

    if (!user.isConfirmed()) {
      return response.status(401).send(new ResponseDto.Error(
        'AccountNotConfirmed',
        [],
      ));
    }

    user.passwordRecoverySend();

    return response.send(new ResponseDto.Success(
      null,
    ));
  }

  async passwordUpdate ({ request, response, params }) {
    const uuid = params.uuidToken;
    const { password, password_confirmation } = request.post();

    if (password !== password_confirmation) {
      return response.status(406).send(new ResponseDto.Error(
        'PasswordConfirmationNotEquals',
        [],
      ));
    }

    const token = await Token.query().where('token', uuid).passwordToken().firstOrFail();
    const user = await token.user().fetch();
    user.password = password;

    await Database.transaction(async () => {
      user.save();
      token.delete();
    });

    return response.send(new ResponseDto.Success(
      user,
    ));
  }

  async signin ({ request, response, auth }) {
    const { email, password } = request.post();
    const user = await User.findBy('email', email);

    if (!user.isConfirmed()) {
      return response.status(401).send(new ResponseDto.Error(
        'AccountNotConfirmed',
        [],
      ));
    }

    const token = await auth.attempt(email, password);

    return response.send(new ResponseDto.Success(
      {
        personal: token,
        user,
      },
    ));
  }
}

module.exports = SignInController;
