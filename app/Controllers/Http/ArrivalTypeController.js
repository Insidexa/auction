'use strict';

const ArrivalType = use('App/Models/ArrivalType');
const ResponseDto = use('App/Dto/ResponseDto');

class ArrivalTypeController {
  async index ({ response }) {
    const arrivalTypes = await ArrivalType.all();

    return response.send(ResponseDto.success(
      arrivalTypes,
    ));
  }
}

module.exports = ArrivalTypeController;
