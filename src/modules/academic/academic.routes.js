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
router.get('/programas', authMiddleware, controller.findAllProgramas);
router.get('/programas/:id', authMiddleware, controller.findProgramaById);
router.post('/programas', authMiddleware, programaValidation, controller.createPrograma);
router.put('/programas/:id', authMiddleware, controller.updatePrograma);
router.delete('/programas/:id', authMiddleware, controller.deletePrograma);

// ─── Asignaturas ────────────────────────────────────────────
router.get('/asignaturas', authMiddleware, controller.findAllAsignaturas);
router.get('/asignaturas/:id', authMiddleware, controller.findAsignaturaById);
router.post('/asignaturas', authMiddleware, asignaturaValidation, controller.createAsignatura);
router.put('/asignaturas/:id', authMiddleware, controller.updateAsignatura);
router.delete('/asignaturas/:id', authMiddleware, controller.deleteAsignatura);

// ─── Grupos ─────────────────────────────────────────────────
router.get('/grupos', authMiddleware, controller.findAllGrupos);
router.get('/grupos/:id', authMiddleware, controller.findGrupoById);
router.post('/grupos', authMiddleware, grupoValidation, controller.createGrupo);
router.put('/grupos/:id', authMiddleware, controller.updateGrupo);
router.delete('/grupos/:id', authMiddleware, controller.deleteGrupo);

module.exports = router;
