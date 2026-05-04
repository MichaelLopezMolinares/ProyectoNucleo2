/**
 * Repositorio: Programas Académicos
 */
const { sequelize } = require('../../../database/sequelize');
const { Programa } = require('../entities/programa.entity');

class ProgramaRepository {
  async findAll() {
    const result = await sequelize.query('SELECT * FROM programas WHERE activo = TRUE ORDER BY nombre');
    return result.map(r => new Programa(r));
  }

  async findById(id) {
    const result = await sequelize.query('SELECT * FROM programas WHERE id = $1', [id]);
    return result[0] ? new Programa(result[0]) : null;
  }

  async findByCodigo(codigo) {
    const result = await sequelize.query('SELECT * FROM programas WHERE codigo = $1', [codigo]);
    return result[0] ? new Programa(result[0]) : null;
  }

  async create({ codigo, nombre, facultad }) {
    const result = await sequelize.sequelize.query(
      'INSERT INTO programas (codigo, nombre, facultad) VALUES ($1, $2, $3) RETURNING *',
      [codigo, nombre, facultad]
    );
    return new Programa(result[0]);
  }

  async update(id, { nombre, facultad, activo }) {
    const result = await sequelize.query(
      'UPDATE programas SET nombre = COALESCE($1, nombre), facultad = COALESCE($2, facultad), activo = COALESCE($3, activo), updated_at = NOW() WHERE id = $4 RETURNING *',
      [nombre, facultad, activo, id]
    );
    return result[0] ? new Programa(result[0]) : null;
  }

  async delete(id) {
    const result = await sequelize.query('DELETE FROM programas WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

module.exports = { ProgramaRepository };
