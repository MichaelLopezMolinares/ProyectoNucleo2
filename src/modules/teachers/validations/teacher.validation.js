/**
 * Validaciones del módulo Docentes
 */
const { body } = require('express-validator');
const { DAYS_LIST } = require('../../../shared/constants/days.constant');

const docenteValidation = [
  body('codigo').trim().notEmpty().withMessage('El código es requerido'),
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido'),
  body('apellido').trim().notEmpty().withMessage('El apellido es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('tipoContrato').isIn(['PLANTA', 'CATEDRA', 'OCASIONAL']).withMessage('Tipo de contrato inválido'),
  body('maxHorasSemana').optional().isInt({ min: 1, max: 60 }).withMessage('Máx horas inválido'),
];

const disponibilidadValidation = [
  body('*.dia').isIn(DAYS_LIST).withMessage('Día inválido'),
  body('*.horaInicio').matches(/^\d{2}:\d{2}$/).withMessage('Formato de hora inválido (HH:MM)'),
  body('*.horaFin').matches(/^\d{2}:\d{2}$/).withMessage('Formato de hora inválido (HH:MM)'),
];

module.exports = { docenteValidation, disponibilidadValidation };
