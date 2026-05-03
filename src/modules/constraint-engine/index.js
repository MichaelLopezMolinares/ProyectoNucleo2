/**
 * Motor de Restricciones – Barrel export
 */
const { ConstraintValidatorService } = require('./services/constraint-validator.service');
const { ConstraintRule } = require('./services/rules/constraint-rule.base');

module.exports = {
  ConstraintValidatorService,
  ConstraintRule,
};
