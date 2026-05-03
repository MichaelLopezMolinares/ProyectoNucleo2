const { Router } = require('express');
const academicRoutes = require('./modules/academic-management/controller/academic.routes');
const teacherRoutes = require('./modules/teachers/controller/teacher.routes');
const classroomRoutes = require('./modules/classrooms/controller/classroom.routes');
const scheduleEngineRoutes = require('./modules/schedule-engine/controller/scheduleEngine.routes');
const scheduleViewerRoutes = require('./modules/schedule-viewer/controller/scheduleViewer.routes');
const authRoutes = require('./modules/auth/controller/auth.routes');
const { authenticate } = require('./core/middlewares/auth');

const router = Router();

// Público
router.use('/auth', authRoutes);

// Protegidos
router.use('/academic', authenticate, academicRoutes);
router.use('/teachers', authenticate, teacherRoutes);
router.use('/classrooms', authenticate, classroomRoutes);
router.use('/schedule-engine', authenticate, scheduleEngineRoutes);
router.use('/schedules', authenticate, scheduleViewerRoutes);

module.exports = router;
