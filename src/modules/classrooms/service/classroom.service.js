const classroomRepo = require('../repository/classroom.repository');
const { NotFoundError } = require('../../../core/errors/AppError');

class ClassroomService {
  async getAllClassrooms() {
    return classroomRepo.findAll();
  }

  async getClassroomById(id) {
    const classroom = await classroomRepo.findById(id);
    if (!classroom) throw new NotFoundError('Aula');
    return classroom;
  }

  async createClassroom(data) {
    return classroomRepo.create(data);
  }

  async updateClassroom(id, data) {
    await this.getClassroomById(id);
    return classroomRepo.update(id, data);
  }

  // Usado internamente por el motor de horarios
  async findAvailableClassrooms(dayOfWeek, startTime, endTime, minCapacity) {
    return classroomRepo.findAvailableForSlot(dayOfWeek, startTime, endTime, minCapacity);
  }
}

module.exports = new ClassroomService();
