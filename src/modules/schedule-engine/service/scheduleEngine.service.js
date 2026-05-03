/**
 * Motor de Generación de Horarios — Componente Central del Sistema
 *
 * Orquesta la generación de horarios usando:
 * - Patrón Strategy (estrategia intercambiable)
 * - Validación de conflictos (delegada a conflict-validator)
 * - Asignación incremental por defecto
 * - Reglas de negocio centralizadas en SchedulingRules
 */

const scheduleRepo = require('../repository/schedule.repository');
const academicService = require('../../academic-management/service/academic.service');
const teacherService = require('../../teachers/service/teacher.service');
const classroomService = require('../../classrooms/service/classroom.service');
const conflictValidator = require('../../conflict-validator/service/conflictValidator.service');
const SchedulingRules = require('../rules/SchedulingRules');
const incrementalStrategy = require('../strategies/IncrementalStrategy');
const backtrackingStrategy = require('../strategies/BacktrackingStrategy');
const { NotFoundError, AppError } = require('../../../core/errors/AppError');
const logger = require('../../../core/utils/logger');

class ScheduleEngineService {
  constructor() {
    this._strategies = {
      incremental: incrementalStrategy,
      backtracking: backtrackingStrategy,
    };
  }

  async createScheduleDraft({ name, academicPeriod, year, semester, programId }) {
    return scheduleRepo.create({ name, academicPeriod, year, semester, programId });
  }

  /**
   * Proceso principal de generación.
   * 1. Carga datos de todos los módulos
   * 2. Selecciona estrategia
   * 3. Ejecuta generación
   * 4. Persiste asignaciones en transacción
   */
  async generateSchedule(scheduleId, options = {}) {
    const schedule = await scheduleRepo.findById(scheduleId);
    if (!schedule) throw new NotFoundError('Horario');

    await scheduleRepo.updateStatus(scheduleId, 'generating');
    logger.info(`🔄 Iniciando generación del horario ${scheduleId}`);

    try {
      // 1. Cargar datos de dominio desde otros módulos (vía servicios)
      const [subjects, teachers, classrooms] = await Promise.all([
        academicService.getSubjectsByProgram(schedule.program_id),
        teacherService.getAllTeachers(),
        classroomService.getAllClassrooms(),
      ]);

      // 2. Construir grupos con sus asignaturas
      const groups = [];
      for (const subject of subjects) {
        const subjectGroups = await academicService.getGroupsBySubject(subject.id);
        for (const group of subjectGroups) {
          groups.push({ ...group, subject });
        }
      }

      // 3. Construir restricciones
      const constraints = {
        availableSlots: options.customSlots || SchedulingRules.generateDefaultSlots(),
        sessionDurationHours: options.sessionDurationHours || SchedulingRules.DEFAULT_SESSION_DURATION_HOURS,
        maxSessionsPerDayPerGroup: SchedulingRules.MAX_SESSIONS_PER_DAY_PER_GROUP,
      };

      // 4. Seleccionar estrategia (Strategy Pattern)
      const strategyName = options.strategy || 'incremental';
      const strategy = this._strategies[strategyName];
      if (!strategy) throw new AppError(`Estrategia '${strategyName}' no existe`, 400);

      logger.info(`📐 Usando estrategia: ${strategyName}`);

      // 5. Ejecutar generación
      const { assignments, unassigned } = await strategy.generate({
        groups, teachers, classrooms, constraints, scheduleId,
      });

      // 6. Persistir asignaciones (transacción atómica)
      await scheduleRepo.deleteAssignments(scheduleId);
      await scheduleRepo.saveAssignments(assignments);
      await scheduleRepo.updateStatus(scheduleId, 'generated');

      logger.info(`✅ Horario ${scheduleId} generado: ${assignments.length} asignaciones, ${unassigned.length} sin asignar`);

      return {
        scheduleId,
        status: 'generated',
        totalAssignments: assignments.length,
        unassignedGroups: unassigned,
      };
    } catch (err) {
      await scheduleRepo.updateStatus(scheduleId, 'failed');
      logger.error(`❌ Generación fallida para horario ${scheduleId}: ${err.message}`);
      throw err;
    }
  }

  async getScheduleById(id) {
    const schedule = await scheduleRepo.findById(id);
    if (!schedule) throw new NotFoundError('Horario');
    return schedule;
  }

  async getAllSchedules() {
    return scheduleRepo.findAll();
  }

  async publishSchedule(id) {
    const schedule = await this.getScheduleById(id);
    if (schedule.status !== 'generated') {
      throw new AppError('Solo se puede publicar un horario en estado "generated"', 400);
    }
    return scheduleRepo.updateStatus(id, 'published');
  }

  async validateExistingSchedule(scheduleId) {
    const assignments = await scheduleRepo.findAssignments(scheduleId);
    const conflicts = [];

    for (const assignment of assignments) {
      const found = await conflictValidator.validate({
        ...assignment,
        excludeId: assignment.id,
        hoursToAssign: 0,
      });
      if (found.length > 0) {
        conflicts.push({ assignment, conflicts: found });
      }
    }

    return { valid: conflicts.length === 0, conflicts };
  }
}

module.exports = new ScheduleEngineService();
