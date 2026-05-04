/**
 * Repositorio: Grupos
 */
const { sequelize } = require('../../../database/sequelize');
const { Grupo } = require('../entities/grupo.entity');

class GrupoRepository {
  async findAll(filters = {}) {
    let sql = 'SELECT * FROM grupos WHERE activo = TRUE';
    const params = [];
    let idx = 1;

    if (filters.asignaturaId) {
      sql += ` AND asignatura_id = $${idx++}`;
      params.push(filters.asignaturaId);
    }
    if (filters.periodo) {
      sql += ` AND periodo = $${idx++}`;
      params.push(filters.periodo);
    }
    if (filters.docenteId) {
      sql += ` AND docente_id = $${idx++}`;
      params.push(filters.docenteId);
    }

    sql += ' ORDER BY codigo';
    const result = await sequelize.query(sql, params);
    return result.map(r => new Grupo(r));
  }

  async findById(id) {
    const result = await sequelize.query('SELECT * FROM grupos WHERE id = $1', [id]);
    return result[0] ? new Grupo(result[0]) : null;
  }

  async findByPeriodo(periodo) {
    const result = await sequelize.query('SELECT * FROM grupos WHERE periodo = $1 AND activo = TRUE', [periodo]);
    return result.map(r => new Grupo(r));
  }

  async create({ codigo, capacidad, jornada, asignaturaId, docenteId, periodo }) {
    const result = await sequelize.query(
      'INSERT INTO grupos (codigo, capacidad, jornada, asignatura_id, docente_id, periodo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [codigo, capacidad, jornada, asignaturaId, docenteId, periodo]
    );
    return new Grupo(result[0]);
  }

  async update(id, { capacidad, jornada, docenteId, activo }) {
    const result = await sequelize.query(
      'UPDATE grupos SET capacidad = COALESCE($1, capacidad), jornada = COALESCE($2, jornada), docente_id = COALESCE($3, docente_id), activo = COALESCE($4, activo), updated_at = NOW() WHERE id = $5 RETURNING *',
      [capacidad, jornada, docenteId, activo, id]
    );
    return result[0] ? new Grupo(result[0]) : null;
  }

  async delete(id) {
    const result = await sequelize.query('DELETE FROM grupos WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

module.exports = { GrupoRepository };
