/**
 * Rutas de Visualización de Horarios
 */
const { Router } = require('express');
const { ScheduleViewController } = require('./controllers/schedule-view.controller');
const { authMiddleware } = require('../auth/middleware/auth.middleware');

const router = Router();
const controller = new ScheduleViewController();

router.get('/', authMiddleware, controller.findAll);
router.get('/:id/view', authMiddleware, controller.getView);
router.get('/:id/docente/:docenteId', authMiddleware, controller.getDocenteView);
router.get('/:id/aula/:aulaId', authMiddleware, controller.getAulaView);
router.get('/:id/stats', authMiddleware, controller.getStats);

module.exports = router;
