/**
 * Servicio: Aulas
 */
const { ClassroomRepository } = require('../repositories/classroom.repository');
const { NotFoundException, ConflictException } = require('../../../shared/exceptions');

class ClassroomService {
  constructor() {
    this.repository = new ClassroomRepository();
  }

  async findAll(filters) {
    return this.repository.findAll(filters);
  }

  async findById(id) {
    const aula = await this.repository.findById(id);
    if (!aula) throw new NotFoundException('Aula', id);
    return aula;
  }

  async findAvailable(dia, horaInicio, horaFin, horarioId) {
    return this.repository.findAvailable(dia, horaInicio, horaFin, horarioId);
  }

  async create(dto) {
    const existing = await this.repository.findByCodigo(dto.codigo);
    if (existing) throw new ConflictException(`Aula con código ${dto.codigo} ya existe`);
    return this.repository.create(dto);
  }

  async update(id, dto) {
    const aula = await this.repository.update(id, dto);
    if (!aula) throw new NotFoundException('Aula', id);
    return aula;
  }

  async delete(id) {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new NotFoundException('Aula', id);
    return true;
  }
}

module.exports = { ClassroomService };
