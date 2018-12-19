'use strict';

const ResponseDto = use('App/Dto/ResponseDto');

class BaseValidator {
  get validateAll () {
    return true;
  }

  async fails (errorMessages) {
    return this.ctx.response
      .status(422)
      .send(ResponseDto.error(
        'ValidationException',
        errorMessages,
      ));
  }
}

module.exports = BaseValidator;
