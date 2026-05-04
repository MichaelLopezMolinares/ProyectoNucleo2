/**
 * Validaciones del módulo Auth
 * Usa express-validator
 */
const { body } = require('express-validator');
const { ROLES_LIST } = require('../../../shared/constants/roles.constant');

const loginValidation = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
];

const registerValidation = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener mínimo 8 caracteres')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('La contraseña debe contener mayúsculas, minúsculas y números'),
  body('rol').isIn(ROLES_LIST).withMessage(`Rol inválido. Valores permitidos: ${ROLES_LIST.join(', ')}`),
];

module.exports = { loginValidation, registerValidation };
