/**
 * Rutas del Motor de Generación de Horarios
 */
const { Router } = require('express');
const { ScheduleEngineController } = require('./controllers/schedule-engine.controller');
const { generateValidation } = require('./validations/schedule-engine.validation');
const { authMiddleware, roleMiddleware } = require('../auth/middleware/auth.middleware');

const router = Router();
const controller = new ScheduleEngineController();

// Estrategias disponibles
router.get('/strategies', controller.getStrategies);

// Generar horario (solo ADMIN y COORDINADOR)
router.post('/generate', roleMiddleware('ADMIN', 'COORDINADOR'), generateValidation, controller.generate);

// Detalle de un horario generado
router.get('/:id', controller.getDetail);

// Publicar horario (solo ADMIN)
router.put('/:id/publish', roleMiddleware('ADMIN'), controller.publish);

module.exports = router;
