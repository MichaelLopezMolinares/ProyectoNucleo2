const { body } = require('express-validator');

const createProgramDto = [
  body('name').notEmpty().withMessage('Nombre del programa es requerido').trim(),
  body('code').notEmpty().withMessage('Código del programa es requerido').trim(),
  body('faculty').notEmpty().withMessage('Facultad es requerida').trim(),
  body('semesters').isInt({ min: 1, max: 12 }).withMessage('Semestres debe ser entre 1 y 12'),
];

const createSubjectDto = [
  body('name').notEmpty().withMessage('Nombre de asignatura es requerido').trim(),
  body('code').notEmpty().withMessage('Código es requerido').trim(),
  body('credits').isInt({ min: 1, max: 10 }).withMessage('Créditos debe ser entre 1 y 10'),
  body('hoursPerWeek').isInt({ min: 1, max: 20 }).withMessage('Horas por semana inválidas'),
  body('programId').isInt().withMessage('ID de programa inválido'),
  body('semester').isInt({ min: 1, max: 12 }).withMessage('Semestre inválido'),
];

const createGroupDto = [
  body('code').notEmpty().withMessage('Código de grupo es requerido'),
  body('subjectId').isInt().withMessage('ID de asignatura inválido'),
  body('semester').isInt({ min: 1, max: 2 }).withMessage('Semestre académico inválido'),
  body('year').isInt({ min: 2020 }).withMessage('Año inválido'),
  body('enrolledStudents').isInt({ min: 1 }).withMessage('Número de estudiantes inválido'),
];

module.exports = { createProgramDto, createSubjectDto, createGroupDto };
