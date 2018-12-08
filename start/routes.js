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
      .post('signup', 'Auth/SignUpController.signup')
      .validator('SignUp')
      .as('user.signup');
    Route
      .post('confirmation/:confirmationToken', 'Auth/SignUpController.confirmation')
      .as('user.confirmation');
    Route
      .post('signin', 'Auth/SignInController.signin')
      .validator('SignIn')
      .as('user.signin');

    // nested route groups are not allowed
    // https://err.sh/adonisjs/errors/E_NESTED_ROUTE_GROUPS
    Route
      .post('password/recovery', 'Auth/SignInController.passwordRecovery')
      .validator('PasswordRecovery')
      .as('user.passwordRecovery');
    Route
      .post('password/update/:recoveryToken', 'Auth/SignInController.passwordUpdate')
      .validator('PasswordUpdate')
      .as('user.passwordUpdate');
  })
  .prefix('api');

Route
  .group(() => {
    Route
      .get('lots/my', 'LotController.my')
      .as('profile.lots.self');
    Route
      .get('lots', 'LotController.index')
      .as('profile.lots');
    Route
      .get('lots/:id', 'LotController.show')
      .as('profile.lots.page');
    Route
      .delete('lots/:id', 'LotController.destroy')
      .as('profile.lots.destroy');
    Route
      .put('lots', 'LotController.update')
      .validator('Lot')
      .as('profile.lots.update');
    Route
      .post('lots', 'LotController.store')
      .validator('Lot')
      .as('profile.lots.store');
  })
  .prefix('api/marketplace')
  .middleware(['auth']);
