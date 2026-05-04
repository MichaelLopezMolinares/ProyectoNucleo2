/**
 * Repositorio: Programas Académicos
 */
const { sequelize } = require('../../../database/sequelize');
const { Programa } = require('../entities/programa.entity');

class ProgramaRepository {
  async findAll() {
    const [rows] = await sequelize.query(
      'SELECT * FROM programas WHERE activo = TRUE ORDER BY nombre'
    );

    return rows.map(r => new Programa(r));
  }

  async findById(id) {
    const [rows] = await sequelize.query(
      'SELECT * FROM programas WHERE id = $1',
      { replacements: [id] }
    );

    return rows[0] ? new Programa(rows[0]) : null;
  }

  async findByCodigo(codigo) {
    const [rows] = await sequelize.query(
      'SELECT * FROM programas WHERE codigo = $1',
      { replacements: [codigo] }
    );

    return rows[0] ? new Programa(rows[0]) : null;
  }

  async create({ codigo, nombre, facultad }) {
    const [rows] = await sequelize.query(
      'INSERT INTO programas (codigo, nombre, facultad) VALUES ($1, $2, $3) RETURNING *',
      { replacements: [codigo, nombre, facultad] }
    );

    return new Programa(rows[0]);
  }

  async update(id, { nombre, facultad, activo }) {
    const [rows] = await sequelize.query(
      `UPDATE programas 
       SET nombre = COALESCE($1, nombre),
           facultad = COALESCE($2, facultad),
           activo = COALESCE($3, activo),
           updated_at = NOW()
       WHERE id = $4 
       RETURNING *`,
      { replacements: [nombre, facultad, activo, id] }
    );

    return rows[0] ? new Programa(rows[0]) : null;
  }

  async delete(id) {
    const [rows] = await sequelize.query(
      'DELETE FROM programas WHERE id = $1',
      { replacements: [id] }
    );

    return rows.length > 0;
  }
}

module.exports = { ProgramaRepository };
