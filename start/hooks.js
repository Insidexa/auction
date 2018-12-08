const { hooks } = require('@adonisjs/ignitor');

hooks.before.providersBooted(() => {
  const Validator = use('Validator');
  const ExistsRule = use('App/Validators/CustomRules/Exists');
  const AgeCheckRule = use('App/Validators/CustomRules/AgeCheck');

  Validator.extend('exists', ExistsRule);
  Validator.extend('ageCheck', AgeCheckRule);
});
