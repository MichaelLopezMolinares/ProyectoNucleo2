/**
 * Rutas de Visualización de Horarios
 */
const { Router } = require('express');
const { ScheduleViewController } = require('./controllers/schedule-view.controller');
const { authMiddleware } = require('../auth/middleware/auth.middleware');

const router = Router();
const controller = new ScheduleViewController();

router.get('/', controller.findAll);
router.get('/:id/view', controller.getView);
router.get('/:id/docente/:docenteId', controller.getDocenteView);
router.get('/:id/aula/:aulaId', controller.getAulaView);
router.get('/:id/stats', controller.getStats);

module.exports = router;
