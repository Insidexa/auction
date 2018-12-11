'use strict';

const SuccessDto = use('App/Dto/SuccessDto');
const ErrorDto = use('App/Dto/ErrorDto');

class ResponseDto {
  /**
   *
   * @param message
   * @param description
   * @returns {ErrorDto}
   */
  static error (message, description) {
    return new ErrorDto(message, description);
  }

  /**
   * @param data
   * @returns {SuccessDto}
   */
  static success (data) {
    return new SuccessDto(data);
  }
}

module.exports = ResponseDto;
