/**
 * Motor de Validación de Conflictos
 * Valida restricciones antes de cada asignación del motor de horarios.
 * Es llamado exclusivamente por schedule-engine (comunicación interna por servicio).
 */

const { query } = require('../../../config/database');

class ConflictValidatorService {
  /**
   * Valida todas las restricciones para una asignación propuesta.
   * Retorna array de conflictos encontrados (vacío = sin conflictos).
   */
  async validate(assignment) {
    const conflicts = [];

    const [teacherConflict, classroomConflict, groupConflict, loadConflict] = await Promise.all([
      this.checkTeacherConflict(assignment),
      this.checkClassroomConflict(assignment),
      this.checkGroupConflict(assignment),
      this.checkTeacherWeeklyLoad(assignment),
    ]);

    if (teacherConflict) conflicts.push(teacherConflict);
    if (classroomConflict) conflicts.push(classroomConflict);
    if (groupConflict) conflicts.push(groupConflict);
    if (loadConflict) conflicts.push(loadConflict);

    return conflicts;
  }

  /**
   * Conflicto de docente: mismo docente en el mismo slot de tiempo
   */
  async checkTeacherConflict({ teacherId, dayOfWeek, startTime, endTime, excludeId }) {
    const { rows } = await query(
      `SELECT sa.id FROM schedule_assignments sa
       WHERE sa.teacher_id = $1
         AND sa.day_of_week = $2
         AND sa.start_time < $4
         AND sa.end_time > $3
         ${excludeId ? 'AND sa.id != $5' : ''}`,
      excludeId
        ? [teacherId, dayOfWeek, startTime, endTime, excludeId]
        : [teacherId, dayOfWeek, startTime, endTime]
    );
    if (rows.length > 0) {
      return {
        type: 'TEACHER_CONFLICT',
        message: `El docente ya tiene una clase asignada en ese horario`,
        detail: { teacherId, dayOfWeek, startTime, endTime },
      };
    }
    return null;
  }

  /**
   * Conflicto de aula: mismo aula en el mismo slot
   */
  async checkClassroomConflict({ classroomId, dayOfWeek, startTime, endTime, excludeId }) {
    const { rows } = await query(
      `SELECT sa.id FROM schedule_assignments sa
       WHERE sa.classroom_id = $1
         AND sa.day_of_week = $2
         AND sa.start_time < $4
         AND sa.end_time > $3
         ${excludeId ? 'AND sa.id != $5' : ''}`,
      excludeId
        ? [classroomId, dayOfWeek, startTime, endTime, excludeId]
        : [classroomId, dayOfWeek, startTime, endTime]
    );
    if (rows.length > 0) {
      return {
        type: 'CLASSROOM_CONFLICT',
        message: `El aula ya está ocupada en ese horario`,
        detail: { classroomId, dayOfWeek, startTime, endTime },
      };
    }
    return null;
  }

  /**
   * Conflicto de grupo: mismo grupo en el mismo slot
   */
  async checkGroupConflict({ groupId, dayOfWeek, startTime, endTime, excludeId }) {
    const { rows } = await query(
      `SELECT sa.id FROM schedule_assignments sa
       WHERE sa.group_id = $1
         AND sa.day_of_week = $2
         AND sa.start_time < $4
         AND sa.end_time > $3
         ${excludeId ? 'AND sa.id != $5' : ''}`,
      excludeId
        ? [groupId, dayOfWeek, startTime, endTime, excludeId]
        : [groupId, dayOfWeek, startTime, endTime]
    );
    if (rows.length > 0) {
      return {
        type: 'GROUP_CONFLICT',
        message: `El grupo ya tiene clase en ese horario`,
        detail: { groupId, dayOfWeek, startTime, endTime },
      };
    }
    return null;
  }

  /**
   * Validación de carga horaria semanal del docente
   */
  async checkTeacherWeeklyLoad({ teacherId, scheduleId, hoursToAssign }) {
    const { rows } = await query(
      `SELECT COALESCE(SUM(
         EXTRACT(EPOCH FROM (end_time::time - start_time::time)) / 3600
       ), 0) AS total_hours
       FROM schedule_assignments
       WHERE teacher_id = $1 AND schedule_id = $2`,
      [teacherId, scheduleId]
    );

    const { rows: teacherRows } = await query(
      'SELECT max_hours_per_week FROM teachers WHERE id = $1',
      [teacherId]
    );

    const currentHours = parseFloat(rows[0].total_hours);
    const maxHours = teacherRows[0]?.max_hours_per_week || 40;

    if (currentHours + hoursToAssign > maxHours) {
      return {
        type: 'TEACHER_OVERLOAD',
        message: `El docente excede su carga máxima de ${maxHours}h semanales`,
        detail: { teacherId, currentHours, hoursToAssign, maxHours },
      };
    }
    return null;
  }
}

module.exports = new ConflictValidatorService();
