'use strict';

const path = require('path');

/*
|--------------------------------------------------------------------------
| Providers
|--------------------------------------------------------------------------
|
| Providers are building blocks for your Adonis app. Anytime you install
| a new Adonis specific package, chances are you will register the
| provider here.
|
*/
const providers = [
  '@adonisjs/framework/providers/AppProvider',
  '@adonisjs/framework/providers/ViewProvider',
  '@adonisjs/lucid/providers/LucidProvider',
  '@adonisjs/bodyparser/providers/BodyParserProvider',
  '@adonisjs/cors/providers/CorsProvider',
  // '@adonisjs/shield/providers/ShieldProvider',
  '@adonisjs/session/providers/SessionProvider',
  '@adonisjs/auth/providers/AuthProvider',

  '@adonisjs/validator/providers/ValidatorProvider',
  '@adonisjs/mail/providers/MailProvider',
  '@adonisjs/drive/providers/DriveProvider',
  '@adonisjs/redis/providers/RedisProvider',

  'adonis-swagger/providers/SwaggerProvider',

  path.join(__dirname, '..', 'providers', 'KueProvider'),
  path.join(__dirname, '..', 'providers', 'JobServiceProvider'),
  path.join(__dirname, '..', 'providers', 'LotJobServiceProvider'),
  path.join(__dirname, '..', 'providers', 'FSServiceProvider'),
  path.join(__dirname, '..', 'providers', 'BidWinnerServiceProvider'),
];

/*
|--------------------------------------------------------------------------
| Ace Providers
|--------------------------------------------------------------------------
|
| Ace providers are required only when running ace commands. For example
| Providers for migrations, tests etc.
|
*/
const aceProviders = [
  '@adonisjs/lucid/providers/MigrationsProvider',

  '@adonisjs/vow/providers/VowProvider',
];

/*
|--------------------------------------------------------------------------
| Aliases
|--------------------------------------------------------------------------
|
| Aliases are short unique names for IoC container bindings. You are free
| to create your own aliases.
|
| For example:
|   { Route: 'Adonis/Src/Route' }
|
*/
const aliases = {
  ImageService: 'App/Services/ImageService',
  TokenMaker: 'App/Services/TokenMaker',
};

const jobs = [
  'App/Jobs/LotStartJob',
  'App/Jobs/LotEndJob',
];

/*
|--------------------------------------------------------------------------
| Commands
|--------------------------------------------------------------------------
|
| Here you store ace commands for your package
|
*/
const commands = [
  'App/Commands/KueUIServer',
];

module.exports = {
  providers, aceProviders, aliases, commands, jobs,
};
