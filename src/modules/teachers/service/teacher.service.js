const teacherRepo = require('../repository/teacher.repository');
const { NotFoundError, ConflictError } = require('../../../core/errors/AppError');

class TeacherService {
  async getAllTeachers() {
    return teacherRepo.findAll();
  }

  async getTeacherById(id) {
    const teacher = await teacherRepo.findById(id);
    if (!teacher) throw new NotFoundError('Docente');
    return teacher;
  }

  async createTeacher(data) {
    const existing = await teacherRepo.findByEmail(data.email);
    if (existing) throw new ConflictError('Ya existe un docente con ese correo');
    return teacherRepo.create(data);
  }

  async updateTeacher(id, data) {
    await this.getTeacherById(id);
    return teacherRepo.update(id, data);
  }

  async getTeacherAvailability(id) {
    await this.getTeacherById(id);
    return teacherRepo.getAvailability(id);
  }

  async setTeacherAvailability(id, slots) {
    await this.getTeacherById(id);
    await teacherRepo.setAvailability(id, slots);
    return teacherRepo.getAvailability(id);
  }

  // Usado internamente por el motor de horarios
  async findAvailableTeachersForSlot(dayOfWeek, startTime, endTime) {
    return teacherRepo.findAvailableForSlot(dayOfWeek, startTime, endTime);
  }
}

module.exports = new TeacherService();
