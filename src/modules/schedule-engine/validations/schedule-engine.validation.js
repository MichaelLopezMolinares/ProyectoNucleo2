/**
 * Validaciones del Motor de Horarios
 */
const { body } = require('express-validator');

const generateValidation = [
  body('periodoId').isUUID().withMessage('ID de periodo inválido'),
  body('estrategia').optional().isIn(['greedy', 'backtracking']).withMessage('Estrategia inválida'),
];

module.exports = { generateValidation };
