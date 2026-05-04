/**
 * Servicio: Docentes
 */
const { TeacherRepository } = require('../repositories/teacher.repository');
const { NotFoundException, ConflictException } = require('../../../shared/exceptions');

class TeacherService {
  constructor() {
    this.repository = new TeacherRepository();
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id) {
    const docente = await this.repository.findById(id);
    if (!docente) throw new NotFoundException('Docente', id);
    return docente;
  }

  async create(dto) {
    const existing = await this.repository.findByCodigo(dto.codigo);
    if (existing) throw new ConflictException(`Docente con código ${dto.codigo} ya existe`);
    return this.repository.create(dto);
  }

  async update(id, dto) {
    const docente = await this.repository.update(id, dto);
    if (!docente) throw new NotFoundException('Docente', id);
    return docente;
  }

  async delete(id) {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new NotFoundException('Docente', id);
    return true;
  }

  // ─── Disponibilidad ─────────────────────────────────────────
  async getDisponibilidad(docenteId) {
    await this.findById(docenteId); // Verificar que existe
    return this.repository.findDisponibilidad(docenteId);
  }

  async setDisponibilidad(docenteId, disponibilidades) {
    await this.findById(docenteId);
    // Reemplazar toda la disponibilidad
    await this.repository.clearDisponibilidad(docenteId);
    const results = [];
    for (const d of disponibilidades) {
      const result = await this.repository.addDisponibilidad(docenteId, d);
      results.push(result);
    }
    return results;
  }
}

module.exports = { TeacherService };
