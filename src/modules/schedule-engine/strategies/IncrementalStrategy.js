const ISchedulingStrategy = require('./ISchedulingStrategy');
const conflictValidator = require('../../conflict-validator/service/conflictValidator.service');

/**
 * Estrategia de asignación incremental (default).
 * Asigna grupo por grupo, franja por franja, validando restricciones en cada paso.
 */
class IncrementalStrategy extends ISchedulingStrategy {
  async generate({ groups, teachers, classrooms, constraints, scheduleId }) {
    const assignments = [];
    const unassigned = [];

    for (const group of groups) {
      const result = await this._assignGroup(group, teachers, classrooms, constraints, scheduleId);
      if (result.success) {
        assignments.push(...result.assignments);
      } else {
        unassigned.push({ group, reasons: result.reasons });
      }
    }

    return { assignments, unassigned };
  }

  async _assignGroup(group, teachers, classrooms, constraints, scheduleId) {
    const hoursNeeded = group.subject.hoursPerWeek;
    const sessionDuration = constraints.sessionDurationHours || 2;
    const sessionsNeeded = Math.ceil(hoursNeeded / sessionDuration);
    const groupAssignments = [];
    const reasons = [];

    for (let session = 0; session < sessionsNeeded; session++) {
      let assigned = false;

      for (const slot of constraints.availableSlots) {
        for (const teacher of teachers) {
          for (const classroom of classrooms) {
            if (classroom.capacity < group.enrolledStudents) continue;

            const candidate = {
              groupId: group.id,
              teacherId: teacher.id,
              classroomId: classroom.id,
              dayOfWeek: slot.dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
              scheduleId,
              hoursToAssign: sessionDuration,
            };

            const conflicts = await conflictValidator.validate(candidate);

            if (conflicts.length === 0) {
              groupAssignments.push(candidate);
              assigned = true;
              break;
            }
          }
          if (assigned) break;
        }
        if (assigned) break;
      }

      if (!assigned) {
        reasons.push(`No se pudo asignar la sesión ${session + 1} del grupo ${group.code}`);
      }
    }

    return {
      success: reasons.length === 0,
      assignments: groupAssignments,
      reasons,
    };
  }
}

module.exports = new IncrementalStrategy();
