/**
 * Rutas del módulo Docentes
 */
const { Router } = require('express');
const { TeacherController } = require('./controllers/teacher.controller');
const { docenteValidation, disponibilidadValidation } = require('./validations/teacher.validation');
const { authMiddleware } = require('../auth/middleware/auth.middleware');

const router = Router();
const controller = new TeacherController();

router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.post('/', docenteValidation, controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

// Disponibilidad
router.get('/:id/disponibilidad', controller.getDisponibilidad);
router.put('/:id/disponibilidad', disponibilidadValidation, controller.setDisponibilidad);

module.exports = router;
