/**
 * Servicio: Grupos
 */
const { GrupoRepository } = require('../repositories/grupo.repository');
const { AsignaturaRepository } = require('../repositories/asignatura.repository');
const { NotFoundException } = require('../../../shared/exceptions');

class GrupoService {
  constructor() {
    this.repository = new GrupoRepository();
    this.asignaturaRepository = new AsignaturaRepository();
  }

  async findAll(filters) {
    return this.repository.findAll(filters);
  }

  async findById(id) {
    const grupo = await this.repository.findById(id);
    if (!grupo) throw new NotFoundException('Grupo', id);
    return grupo;
  }

  async findByPeriodo(periodo) {
    return this.repository.findByPeriodo(periodo);
  }

  async create(dto) {
    const asignatura = await this.asignaturaRepository.findById(dto.asignaturaId);
    if (!asignatura) throw new NotFoundException('Asignatura', dto.asignaturaId);
    return this.repository.create(dto);
  }

  async update(id, dto) {
    const grupo = await this.repository.update(id, dto);
    if (!grupo) throw new NotFoundException('Grupo', id);
    return grupo;
  }

  async delete(id) {
    const deleted = await this.repository.delete(id);
    if (!deleted) throw new NotFoundException('Grupo', id);
    return true;
  }
}

module.exports = { GrupoService };
