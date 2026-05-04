const scheduleRepo = require('../../schedule-engine/repository/schedule.repository');
const { NotFoundError } = require('../../../core/errors/AppError');

class ScheduleViewerService {
  async getFullSchedule(scheduleId) {
    const schedule = await scheduleRepo.findById(scheduleId);
    if (!schedule) throw new NotFoundError('Horario');
    const assignments = await scheduleRepo.findAssignments(scheduleId);
    return { schedule, assignments };
  }

  async getScheduleByTeacher(scheduleId, teacherId) {
    const assignments = await scheduleRepo.findAssignments(scheduleId);
    return assignments.filter(a => a.teacher_id === parseInt(teacherId));
  }

  async getScheduleByGroup(scheduleId, groupId) {
    const assignments = await scheduleRepo.findAssignments(scheduleId);
    return assignments.filter(a => a.group_id === parseInt(groupId));
  }

  async getScheduleByClassroom(scheduleId, classroomId) {
    const assignments = await scheduleRepo.findAssignments(scheduleId);
    return assignments.filter(a => a.classroom_id === parseInt(classroomId));
  }

  /**
   * Formatea el horario como matriz día/hora para visualización en frontend
   */
  async getScheduleMatrix(scheduleId) {
    const assignments = await scheduleRepo.findAssignments(scheduleId);
    const matrix = {};

    for (const a of assignments) {
      const day = a.day_of_week;
      const slot = `${a.start_time}-${a.end_time}`;
      if (!matrix[day]) matrix[day] = {};
      if (!matrix[day][slot]) matrix[day][slot] = [];
      matrix[day][slot].push({
        group: a.group_code,
        subject: a.subject_name,
        teacher: a.teacher_name,
        classroom: `${a.classroom_name} (${a.building})`,
      });
    }
    return matrix;
  }
}

module.exports = new ScheduleViewerService();
