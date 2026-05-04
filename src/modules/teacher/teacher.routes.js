/**
 * Rutas del módulo Docentes
 */
const { Router } = require('express');
const { TeacherController } = require('./controllers/teacher.controller');
const { docenteValidation, disponibilidadValidation } = require('./validations/teacher.validation');
const { authMiddleware } = require('../auth/middleware/auth.middleware');

const router = Router();
const controller = new TeacherController();

router.get('/', authMiddleware, controller.findAll);
router.get('/:id', authMiddleware, controller.findById);
router.post('/', authMiddleware, docenteValidation, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);

// Disponibilidad
router.get('/:id/disponibilidad', authMiddleware, controller.getDisponibilidad);
router.put('/:id/disponibilidad', authMiddleware, disponibilidadValidation, controller.setDisponibilidad);

module.exports = router;
