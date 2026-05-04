/**
 * Rutas del módulo Aulas
 */
const { Router } = require('express');
const { ClassroomController } = require('./controllers/classroom.controller');
const { aulaValidation } = require('./validations/classroom.validation');
const { authMiddleware } = require('../auth/middleware/auth.middleware');

const router = Router();
const controller = new ClassroomController();

router.get('/', controller.findAll);
router.get('/:id', controller.findById);
router.post('/', aulaValidation, controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
