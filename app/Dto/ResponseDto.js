class Success {
  constructor (data, code) {
    this.data = data;
    this.code = code;
  }
}

class Error {
  constructor (message, errors, code) {
    this.message = message;
    this.errors = errors;
    this.code = code;
  }
}

class ResponseDto {
  /**
   * @returns {Error}
   * @constructor
   */
  static Error (message, errors, code) {
    return new Error(message, errors, code);
  }

  /**
   * @param data
   * @param code
   * @returns {Success}
   * @constructor
   */
  static Success (data, code = 200) {
    return new Success(data, code);
  }
}

module.exports.ResponseDto = ResponseDto;
module.exports.Success = Success;
module.exports.Error = Error;
