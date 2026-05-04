/**
 * Repositorio: Asignaturas
 */
const { sequelize } = require('../../../database/sequelize');
const { Asignatura } = require('../entities/asignatura.entity');

class AsignaturaRepository {
  async findAll(programaId = null) {
    let sql = 'SELECT * FROM asignaturas WHERE activo = TRUE';
    const params = [];
    if (programaId) {
      sql += ' AND programa_id = $1';
      params.push(programaId);
    }
    sql += ' ORDER BY semestre, nombre';
    const result = await query(sql, params);
    return result.rows.map(r => new Asignatura(r));
  }

  async findById(id) {
    const result = await query('SELECT * FROM asignaturas WHERE id = $1', [id]);
    return result.rows[0] ? new Asignatura(result.rows[0]) : null;
  }

  async findByCodigo(codigo) {
    const result = await query('SELECT * FROM asignaturas WHERE codigo = $1', [codigo]);
    return result.rows[0] ? new Asignatura(result.rows[0]) : null;
  }

  async create({ codigo, nombre, creditos, horasSemanales, semestre, programaId }) {
    const result = await query(
      'INSERT INTO asignaturas (codigo, nombre, creditos, horas_semanales, semestre, programa_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [codigo, nombre, creditos, horasSemanales, semestre, programaId]
    );
    return new Asignatura(result.rows[0]);
  }

  async update(id, { nombre, creditos, horasSemanales, semestre, activo }) {
    const result = await query(
      'UPDATE asignaturas SET nombre = COALESCE($1, nombre), creditos = COALESCE($2, creditos), horas_semanales = COALESCE($3, horas_semanales), semestre = COALESCE($4, semestre), activo = COALESCE($5, activo), updated_at = NOW() WHERE id = $6 RETURNING *',
      [nombre, creditos, horasSemanales, semestre, activo, id]
    );
    return result.rows[0] ? new Asignatura(result.rows[0]) : null;
  }

  async delete(id) {
    const result = await query('DELETE FROM asignaturas WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

module.exports = { AsignaturaRepository };
