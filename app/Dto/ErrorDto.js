'use string';

class ErrorDto {
  constructor (message, description = null) {
    this.message = message;
    this.description = description;
  }
}

module.exports = ErrorDto;
