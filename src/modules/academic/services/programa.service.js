/**
 * Servicio: Programas Académicos
 */
const { ProgramaRepository } = require('../repositories/programa.repository');
const { NotFoundException, ConflictException } = require('../../../shared/exceptions');

class ProgramaService {
  constructor() {
    this.repository = new ProgramaRepository();
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findById(id) {
    const programa = await this.repository.findById(id);
    if (!programa) throw new NotFoundException('Programa', id);
    return programa;
  }

  async create(dto) {
    const existing = await this.repository.findByCodigo(dto.codigo);
    if (existing) throw new ConflictException(`Programa con código ${dto.codigo} ya existe`);
    return this.repository.create(dto);
  }

  async update(id, dto) {
    const programa = await this.repository.update(id, dto);
    if (!programa) throw new NotFoundException('Programa', id);
    return programa;
  }

  async delete(id) {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new NotFoundException('Programa', id);
    return true;
  }
}

module.exports = { ProgramaService };
