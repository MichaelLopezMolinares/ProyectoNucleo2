/**
 * Validaciones del módulo Académico
 */
const { body } = require('express-validator');

const programaValidation = [
  body('codigo').trim().notEmpty().withMessage('El código es requerido'),
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
];

const asignaturaValidation = [
  body('codigo').trim().notEmpty().withMessage('El código es requerido'),
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
  body('creditos').isInt({ min: 1 }).withMessage('Los créditos deben ser un entero positivo'),
  body('horasSemanales').isInt({ min: 1 }).withMessage('Las horas semanales deben ser un entero positivo'),
  body('semestre').optional().isInt({ min: 1, max: 12 }).withMessage('El semestre debe estar entre 1 y 12'),
  body('programaId').isUUID().withMessage('ID de programa inválido'),
];

const grupoValidation = [
  body('codigo').trim().notEmpty().withMessage('El código es requerido'),
  body('capacidad').isInt({ min: 1 }).withMessage('La capacidad debe ser un entero positivo'),
  body('jornada').isIn(['DIURNA', 'NOCTURNA', 'MIXTA']).withMessage('Jornada inválida'),
  body('asignaturaId').isUUID().withMessage('ID de asignatura inválido'),
  body('periodo').trim().notEmpty().withMessage('El periodo es requerido'),
];

module.exports = { programaValidation, asignaturaValidation, grupoValidation };
