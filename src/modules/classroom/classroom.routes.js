/**
 * Rutas del módulo Aulas
 */
const { Router } = require('express');
const { ClassroomController } = require('./controllers/classroom.controller');
const { aulaValidation } = require('./validations/classroom.validation');
const { authMiddleware } = require('../auth/middleware/auth.middleware');

const router = Router();
const controller = new ClassroomController();

router.get('/', authMiddleware, controller.findAll);
router.get('/:id', authMiddleware, controller.findById);
router.post('/', authMiddleware, aulaValidation, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);

module.exports = router;
