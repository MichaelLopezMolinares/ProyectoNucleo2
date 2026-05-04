/**
 * Repositorio: Programas Académicos
 */
const { sequelize } = require('../../../database/sequelize');
const { Programa } = require('../entities/programa.entity');

class ProgramaRepository {
  async findAll() {
    const result = await query('SELECT * FROM programas WHERE activo = TRUE ORDER BY nombre');
    return result.rows.map(r => new Programa(r));
  }

  async findById(id) {
    const result = await query('SELECT * FROM programas WHERE id = $1', [id]);
    return result.rows[0] ? new Programa(result.rows[0]) : null;
  }

  async findByCodigo(codigo) {
    const result = await query('SELECT * FROM programas WHERE codigo = $1', [codigo]);
    return result.rows[0] ? new Programa(result.rows[0]) : null;
  }

  async create({ codigo, nombre, facultad }) {
    const result = await query(
      'INSERT INTO programas (codigo, nombre, facultad) VALUES ($1, $2, $3) RETURNING *',
      [codigo, nombre, facultad]
    );
    return new Programa(result.rows[0]);
  }

  async update(id, { nombre, facultad, activo }) {
    const result = await query(
      'UPDATE programas SET nombre = COALESCE($1, nombre), facultad = COALESCE($2, facultad), activo = COALESCE($3, activo), updated_at = NOW() WHERE id = $4 RETURNING *',
      [nombre, facultad, activo, id]
    );
    return result.rows[0] ? new Programa(result.rows[0]) : null;
  }

  async delete(id) {
    const result = await query('DELETE FROM programas WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

module.exports = { ProgramaRepository };
