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
const Order = use('App/Models/Order');

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

    // TODO: show, index method
    Route
      .resource('bids', 'BidController')
      .only(['store'])
      .validator(new Map([
        [['bids.store'], ['Bid']],
      ]));
    Route
      .resource('orders', 'OrderController')
      .only(['update', 'show'])
      .middleware(new Map([
        [['orders.update'], [`canChangeOrderStatus:${Order.CUSTOMER}:${Order.PENDING_STATUS}`]],
      ]))
      .validator(new Map([
        [['orders.update'], ['OrderUpdate']],
      ]));
    Route
      .put('orders/:id/execute', 'OrderController.sellerExecute')
      .middleware([`canChangeOrderStatus:${Order.SELLER}:${Order.PENDING_STATUS}`])
      .as('orders.sellerExecute');
    Route
      .put('orders/:id/receive', 'OrderController.customerReceive')
      .middleware([`canChangeOrderStatus:${Order.CUSTOMER}:${Order.SEND_STATUS}`])
      .as('orders.customerReceive');
  })
  .prefix('api/profile')
  .middleware(['auth']);

Route
  .group(() => {
    Route
      .resource('arrival-types', 'ArrivalTypeController')
      .only(['arrival-types.index']);
    Route
      .get('lots', 'LotController.all')
      .as('lots.all');
    Route
      .get('lots/:id', 'LotController.show')
      .as('lots.show');
  })
  .middleware(['auth'])
  .prefix('api/marketplace');
