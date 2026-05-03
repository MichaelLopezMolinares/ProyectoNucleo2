const ISchedulingStrategy = require('./ISchedulingStrategy');
const conflictValidator = require('../../conflict-validator/service/conflictValidator.service');

/**
 * Estrategia con backtracking para casos donde la incremental falla.
 * Más costosa computacionalmente, pero encuentra más soluciones.
 */
class BacktrackingStrategy extends ISchedulingStrategy {
  async generate({ groups, teachers, classrooms, constraints, scheduleId }) {
    const assignments = [];
    const success = await this._backtrack(0, groups, teachers, classrooms, constraints, scheduleId, assignments);
    return {
      assignments: success ? assignments : [],
      unassigned: success ? [] : groups.map(g => ({ group: g, reasons: ['Backtracking falló'] })),
    };
  }

  async _backtrack(index, groups, teachers, classrooms, constraints, scheduleId, assignments) {
    if (index === groups.length) return true;

    const group = groups[index];

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
            hoursToAssign: 2,
          };

          const conflicts = await conflictValidator.validate(candidate);

          if (conflicts.length === 0) {
            assignments.push(candidate);
            const result = await this._backtrack(index + 1, groups, teachers, classrooms, constraints, scheduleId, assignments);
            if (result) return true;
            assignments.pop(); // Retroceder
          }
        }
      }
    }
    return false;
  }
}

module.exports = new BacktrackingStrategy();
