/**
 * Validaciones del módulo Aulas
 */
const { body } = require('express-validator');

const aulaValidation = [
  body('codigo').trim().notEmpty().withMessage('El código es requerido'),
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
  body('capacidad').isInt({ min: 1 }).withMessage('La capacidad debe ser un entero positivo'),
  body('tipo').isIn(['REGULAR', 'LABORATORIO', 'AUDITORIO', 'SALA_COMPUTO']).withMessage('Tipo de aula inválido'),
];

module.exports = { aulaValidation };
