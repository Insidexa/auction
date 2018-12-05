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
    Route.post('signup', 'SignUpController.signup').validator('SignUp');
    Route.post('confirmation/:uuidToken', 'SignUpController.confirmation');
    Route.post('signin', 'SignInController.signin').validator('SignIn');
  })
  .prefix('api');
