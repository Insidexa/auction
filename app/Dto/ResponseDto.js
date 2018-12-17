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
   * @param meta
   * @returns {{data: *, meta: *}}
   */
  static success (data, meta) {
    const response = new SuccessDto(data);

    return {
      ...response,
      meta,
    };
  }
}

module.exports = ResponseDto;
