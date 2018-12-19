'use strict';

class ResponseDto {
  /**
   *
   * @param message
   * @param description
   * @returns {{message: *, description: *}}
   */
  static error (message, description) {
    return {
      message,
      description,
    };
  }

  /**
   * @param data
   * @param meta
   * @returns {{data: *, meta: *}}
   */
  static success (data, meta) {
    return {
      data,
      meta,
    };
  }
}

module.exports = ResponseDto;
