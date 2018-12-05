'use strict';

const BaseExceptionHandler = use('BaseExceptionHandler');
const ResponseDto = use('App/Dto/ResponseDto');

/**
 * This class handles all exceptions thrown during
 * the HTTP request lifecycle.
 *
 * @class ExceptionHandler
 */
class ExceptionHandler extends BaseExceptionHandler {
  /**
   * Handle exception thrown during the HTTP lifecycle
   *
   * @method handle
   *
   * @param  {Object} error
   * @param response
   *
   * @return {void}
   */
  async handle (error, { response }) {
    switch (error.name) {
      case 'ValidationException':
        response.status(error.status).send(new ResponseDto.Error(
          error.name,
          error.messages,
        ));
        break;

      default:
        response.status(error.status).send(new ResponseDto.Error(
          error.name,
          error.message,
        ));
    }
  }

  /**
   * Report exception for logging or debugging.
   *
   * @method report
   *
   * @param  {Object} error
   * @param request
   *
   * @return {void}
   */
  // eslint-disable-next-line no-unused-vars,no-empty-function
  async report (error, { request }) {
  }
}

module.exports = ExceptionHandler;
