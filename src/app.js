/**
 * Agenda Fácil – Aplicación Express
 * Monolito modular con arquitectura en capas
 *
 * Registro centralizado de módulos y middleware
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { serverConfig } = require('./config/server.config');
const { errorHandler } = require('./shared/middleware/error-handler.middleware');

// ─── Importar rutas de módulos ──────────────────────────────────
const authRoutes = require('./modules/auth/auth.routes');
const academicRoutes = require('./modules/academic/academic.routes');
const teacherRoutes = require('./modules/teacher/teacher.routes');
const classroomRoutes = require('./modules/classroom/classroom.routes');
const scheduleEngineRoutes = require('./modules/schedule-engine/schedule-engine.routes');
const scheduleViewRoutes = require('./modules/schedule-view/schedule-view.routes');

// ─── Crear aplicación Express ───────────────────────────────────
const app = express();

// ─── Middleware globales ────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: serverConfig.corsOrigin, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Registrar rutas de módulos ─────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/schedule-engine', scheduleEngineRoutes);
app.use('/api/schedules', scheduleViewRoutes);

// ─── Ruta no encontrada ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'ROUTE_NOT_FOUND', message: `Ruta ${req.method} ${req.path} no existe` },
  });
});

// ─── Middleware de manejo de errores (siempre al final) ─────────
app.use(errorHandler);

module.exports = app;
