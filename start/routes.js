'use strict';

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route');

Route
  .group(() => {
    Route
      .post('signup', 'SignUpController.signup')
      .validator('SignUp')
      .as('user.signup');
    Route
      .post('confirmation/:confirmationToken', 'SignUpController.confirmation')
      .as('user.confirmation');
    Route
      .post('signin', 'SignInController.signin')
      .validator('SignIn')
      .as('user.signin');

    // nested route groups are not allowed
    // https://err.sh/adonisjs/errors/E_NESTED_ROUTE_GROUPS
    Route
      .post('password/recovery', 'SignInController.passwordRecovery')
      .validator('PasswordRecovery')
      .as('user.passwordRecovery');
    Route
      .post('password/update/:recoveryToken', 'SignInController.passwordUpdate')
      .validator('PasswordUpdate')
      .as('user.passwordUpdate');
  })
  .prefix('api')
  .namespace('Auth');

Route
  .group(() => {
    Route
      .resource('lots', 'LotController')
      .only(['destroy', 'update', 'store'])
      .validator(new Map([
        [['lots.update', 'lots.store'], ['Lot']],
      ]));

    Route
      .get('lots/self', 'LotController.self')
      .as('lots.self');
  })
  .prefix('api/profile')
  .middleware(['auth']);

Route
  .group(() => {
    Route
      .get('lots', 'LotController.all')
      .as('lots.all');
    Route
      .get('lots/:id', 'LotController.show')
      .as('lots.page');
  })
  .prefix('api/marketplace');
