const { Router } = require('express');
const ctrl = require('./academic.controller');
const { createProgramDto, createSubjectDto, createGroupDto } = require('../dto/CreateProgramDto');
const { authorize } = require('../../../core/middlewares/auth');

const router = Router();

// Programas
router.get('/programs', ctrl.getPrograms.bind(ctrl));
router.get('/programs/:id', ctrl.getProgram.bind(ctrl));
router.post('/programs', authorize('admin'), createProgramDto, ctrl.createProgram.bind(ctrl));
router.put('/programs/:id', authorize('admin'), createProgramDto, ctrl.updateProgram.bind(ctrl));
router.delete('/programs/:id', authorize('admin'), ctrl.deleteProgram.bind(ctrl));

// Asignaturas
router.get('/programs/:programId/subjects', ctrl.getSubjectsByProgram.bind(ctrl));
router.post('/subjects', authorize('admin'), createSubjectDto, ctrl.createSubject.bind(ctrl));

// Grupos
router.post('/groups', authorize('admin', 'coordinator'), createGroupDto, ctrl.createGroup.bind(ctrl));

module.exports = router;
