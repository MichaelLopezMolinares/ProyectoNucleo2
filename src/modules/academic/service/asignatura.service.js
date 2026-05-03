/**
 * Servicio: Asignaturas
 */
const { AsignaturaRepository } = require('../repositories/asignatura.repository');
const { ProgramaRepository } = require('../repositories/programa.repository');
const { NotFoundException, ConflictException } = require('../../../shared/exceptions');

class AsignaturaService {
  constructor() {
    this.repository = new AsignaturaRepository();
    this.programaRepository = new ProgramaRepository();
  }

  async findAll(programaId) {
    return this.repository.findAll(programaId);
  }

  async findById(id) {
    const asignatura = await this.repository.findById(id);
    if (!asignatura) throw new NotFoundException('Asignatura', id);
    return asignatura;
  }

  async create(dto) {
    // Verificar que el programa existe
    const programa = await this.programaRepository.findById(dto.programaId);
    if (!programa) throw new NotFoundException('Programa', dto.programaId);

    const existing = await this.repository.findByCodigo(dto.codigo);
    if (existing) throw new ConflictException(`Asignatura con código ${dto.codigo} ya existe`);

    return this.repository.create(dto);
  }

  async update(id, dto) {
    const asignatura = await this.repository.update(id, dto);
    if (!asignatura) throw new NotFoundException('Asignatura', id);
    return asignatura;
  }

  async delete(id) {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new NotFoundException('Asignatura', id);
    return true;
  }
}

module.exports = { AsignaturaService };
