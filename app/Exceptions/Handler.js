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
      case 'PasswordMisMatchException':
        response.status(404).send(ResponseDto.error(
          'ModelNotFoundException',
        ));
        break;

      default:
        response.status(error.status).send(ResponseDto.error(
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
