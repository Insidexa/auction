'use strict';

const Database = use('Database');
const Token = use('App/Models/Token');
const User = use('App/Models/User');
const ResponseDto = use('App/Dto/ResponseDto');

class SignUpController {
  async signup ({ request, response }) {
    const all = request.all();
    const user = new User();
    user.fill(all);
    await user.save();

    return response.send(new ResponseDto.Success(
      user,
    ));
  }

  async confirmation ({ params, response }) {
    const uuid = params.uuidToken;
    const token = await Token.query().confirmToken().where('token', uuid).firstOrFail();

    if (!token.isActive()) {
      return response.status(403).send(new ResponseDto.Error(
        'TokenRevoked',
      ));
    }

    const user = await token.user().fetch();
    await Database.transaction(async () => {
      user.emailConfirmed();
      user.save();

      token.delete();
    });

    return response.send(new ResponseDto.Success(
      user,
    ));
  }
}

module.exports = SignUpController;
