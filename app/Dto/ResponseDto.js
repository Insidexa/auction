class Success {
  constructor (data) {
    this.data = data;
  }
}

class Error {
  constructor (message, errors) {
    this.message = message;
    this.errors = errors;
  }
}

class ResponseDto {
  /**
   *
   * @param message
   * @param errors
   * @returns {Error}
   * @constructor
   */
  static Error (message, errors) {
    return new Error(message, errors);
  }

  /**
   * @param data
   * @returns {Success}
   * @constructor
   */
  static Success (data) {
    return new Success(data);
  }
}

module.exports = ResponseDto;
module.exports.Success = Success;
module.exports.Error = Error;
