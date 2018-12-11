const { hooks } = require('@adonisjs/ignitor');

hooks.before.providersBooted(() => {
  const Validator = use('Validator');
  const ExistsRule = use('App/Validators/CustomRules/Exists');
  const AgeCheckRule = use('App/Validators/CustomRules/AgeCheck');
  const LotCheckEndDate = use('App/Validators/CustomRules/LotCheckEndDate');
  const LotCheckStartDate = use('App/Validators/CustomRules/LotCheckStartDate');

  Validator.extend('exists', ExistsRule);
  Validator.extend('ageCheck', AgeCheckRule);
  Validator.extend('lotCheckEndDate', LotCheckEndDate);
  Validator.extend('lotCheckStartDate', LotCheckStartDate);
});
