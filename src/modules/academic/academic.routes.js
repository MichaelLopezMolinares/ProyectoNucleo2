/**
 * Rutas del módulo Académico
 */
const { Router } = require('express');
const { AcademicController } = require('./controllers/academic.controller');
const { programaValidation, asignaturaValidation, grupoValidation } = require('./validations/academic.validation');
const { authMiddleware } = require('../auth/middleware/auth.middleware');

const router = Router();
const controller = new AcademicController();

// ─── Programas ──────────────────────────────────────────────
router.get('/programas', controller.findAllProgramas);
router.get('/programas/:id', controller.findProgramaById);
router.post('/programas', programaValidation, controller.createPrograma);
router.put('/programas/:id', controller.updatePrograma);
router.delete('/programas/:id', controller.deletePrograma);

// ─── Asignaturas ────────────────────────────────────────────
router.get('/asignaturas', controller.findAllAsignaturas);
router.get('/asignaturas/:id', controller.findAsignaturaById);
router.post('/asignaturas', asignaturaValidation, controller.createAsignatura);
router.put('/asignaturas/:id', controller.updateAsignatura);
router.delete('/asignaturas/:id', controller.deleteAsignatura);

// ─── Grupos ─────────────────────────────────────────────────
router.get('/grupos', controller.findAllGrupos);
router.get('/grupos/:id', controller.findGrupoById);
router.post('/grupos', grupoValidation, controller.createGrupo);
router.put('/grupos/:id', controller.updateGrupo);
router.delete('/grupos/:id', controller.deleteGrupo);

module.exports = router;
