/**
 * Repositorio: Grupos
 */
const { sequelize } = require('../../../database/sequelize');
const { Grupo } = require('../entities/grupo.entity');

class GrupoRepository {
  async findAll(filters = {}) {
    let sql = 'SELECT * FROM grupos WHERE activo = TRUE';
    const replacements = {};

    if (filters.asignaturaId) {
      sql += ' AND asignatura_id = :asignaturaId';
      replacements.asignaturaId = filters.asignaturaId;
    }

    if (filters.periodo) {
      sql += ' AND periodo = :periodo';
      replacements.periodo = filters.periodo;
    }

    if (filters.docenteId) {
      sql += ' AND docente_id = :docenteId';
      replacements.docenteId = filters.docenteId;
    }

    sql += ' ORDER BY codigo';

    const [rows] = await sequelize.query(sql, {
      replacements
    });

    return rows.map(r => new Grupo(r));
  }

  async findById(id) {
    const [rows] = await sequelize.query(
      'SELECT * FROM grupos WHERE id = :id',
      { replacements: { id } }
    );

    return rows[0] ? new Grupo(rows[0]) : null;
  }

  async findByPeriodo(periodo) {
    const [rows] = await sequelize.query(
      'SELECT * FROM grupos WHERE periodo = :periodo AND activo = TRUE',
      { replacements: { periodo } }
    );

    return rows.map(r => new Grupo(r));
  }

  async create({ codigo, capacidad, jornada, asignaturaId, docenteId, periodo }) {
    const [rows] = await sequelize.query(
      `INSERT INTO grupos 
      (codigo, capacidad, jornada, asignatura_id, docente_id, periodo)
      VALUES (:codigo, :capacidad, :jornada, :asignaturaId, :docenteId, :periodo)
      RETURNING *`,
      {
        replacements: {
          codigo,
          capacidad,
          jornada,
          asignaturaId,
          docenteId,
          periodo
        }
      }
    );

    return new Grupo(rows[0]);
  }

  async update(id, { capacidad, jornada, docenteId, activo }) {
    const [rows] = await sequelize.query(
      `UPDATE grupos 
       SET capacidad = COALESCE(:capacidad, capacidad),
           jornada = COALESCE(:jornada, jornada),
           docente_id = COALESCE(:docenteId, docente_id),
           activo = COALESCE(:activo, activo),
           updated_at = NOW()
       WHERE id = :id
       RETURNING *`,
      {
        replacements: {
          capacidad,
          jornada,
          docenteId,
          activo,
          id
        }
      }
    );

    return rows[0] ? new Grupo(rows[0]) : null;
  }

  async delete(id) {
    const [rows] = await sequelize.query(
      'DELETE FROM grupos WHERE id = :id',
      { replacements: { id } }
    );

    return rows.length > 0;
  }
}

module.exports = { GrupoRepository };