const academicRepo = require('../repository/academic.repository');
const { NotFoundError, ConflictError } = require('../../../core/errors/AppError');

class AcademicService {
  // ── Programas ──────────────────────────────────────
  async getAllPrograms() {
    return academicRepo.findAllPrograms();
  }

  async getProgramById(id) {
    const program = await academicRepo.findProgramById(id);
    if (!program) throw new NotFoundError('Programa');
    return program;
  }

  async createProgram(data) {
    return academicRepo.createProgram(data);
  }

  async updateProgram(id, data) {
    await this.getProgramById(id);
    return academicRepo.updateProgram(id, data);
  }

  async deleteProgram(id) {
    await this.getProgramById(id);
    await academicRepo.deleteProgram(id);
  }

  // ── Asignaturas ────────────────────────────────────
  async getSubjectsByProgram(programId) {
    await this.getProgramById(programId);
    return academicRepo.findSubjectsByProgram(programId);
  }

  async createSubject(data) {
    await this.getProgramById(data.programId);
    return academicRepo.createSubject(data);
  }

  // ── Grupos ─────────────────────────────────────────
  async getGroupsBySubject(subjectId) {
    const subject = await academicRepo.findSubjectById(subjectId);
    if (!subject) throw new NotFoundError('Asignatura');
    return academicRepo.findGroupsBySubject(subjectId);
  }

  async createGroup(data) {
    const subject = await academicRepo.findSubjectById(data.subjectId);
    if (!subject) throw new NotFoundError('Asignatura');
    return academicRepo.createGroup(data);
  }
}

module.exports = new AcademicService();
