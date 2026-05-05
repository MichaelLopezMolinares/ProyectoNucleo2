/**
 * Repositorio: Grupos — CORRECCIÓN
 *
 * BUG CORREGIDO en create():
 *   La query original tenía `periodoId` (camelCase) como nombre de columna
 *   en el INSERT, pero la columna real en PostgreSQL es `periodo_id` (snake_case).
 *   Esto causaba un error en la inserción de nuevos grupos.
 *
 *   Antes:  VALUES (..., :periodoId) → columna `periodoId` (no existe)
 *   Ahora:  VALUES (..., :periodoId) → columna `periodo_id` ✔
 */
const { sequelize } = require('../../../database/sequelize');
const { Grupo }     = require('../entities/grupo.entity');

class GrupoRepository {
  async findAll(filters = {}) {
    let sql = 'SELECT * FROM grupos WHERE activo = TRUE';
    const replacements = {};

    if (filters.asignaturaId) {
      sql += ' AND asignatura_id = :asignaturaId';
      replacements.asignaturaId = filters.asignaturaId;
    }

    if (filters.periodoId) {
      sql += ' AND periodo_id = :periodoId';
      replacements.periodoId = filters.periodoId;
    }

    if (filters.docenteId) {
      sql += ' AND docente_id = :docenteId';
      replacements.docenteId = filters.docenteId;
    }

    sql += ' ORDER BY codigo';

    const [rows] = await sequelize.query(sql, { replacements });
    return rows.map(r => new Grupo(r));
  }

  async findById(id) {
    const [rows] = await sequelize.query(
      'SELECT * FROM grupos WHERE id = :id',
      { replacements: { id } }
    );
    return rows[0] ? new Grupo(rows[0]) : null;
  }

  async findByPeriodo(periodoId) {
    const [rows] = await sequelize.query(
      'SELECT * FROM grupos WHERE periodo_id = :periodoId AND activo = TRUE ORDER BY codigo',
      { replacements: { periodoId } }
    );
    return rows.map(r => new Grupo(r));
  }

  async create({ codigo, capacidad, jornada, docenteId, periodoId }) {
    // ✔ CORREGIDO: columna es `periodo_id`, no `periodoId`
    // ✔ NOTA: asignatura_id ya no va en grupos sino en grupo_asignaturas
    const [rows] = await sequelize.query(
      `INSERT INTO grupos
         (codigo, capacidad, jornada, docente_id, periodo_id)
       VALUES
         (:codigo, :capacidad, :jornada, :docenteId, :periodoId)
       RETURNING *`,
      {
        replacements: { codigo, capacidad, jornada, docenteId, periodoId },
      }
    );
    return new Grupo(rows[0]);
  }

  async update(id, { capacidad, jornada, activo }) {
    const [rows] = await sequelize.query(
      `UPDATE grupos
       SET capacidad  = COALESCE(:capacidad, capacidad),
           jornada    = COALESCE(:jornada,   jornada),
           activo     = COALESCE(:activo,    activo),
           updated_at = NOW()
       WHERE id = :id
       RETURNING *`,
      { replacements: { capacidad, jornada, activo, id } }
    );
    return rows[0] ? new Grupo(rows[0]) : null;
  }

  async delete(id) {
    const [rows] = await sequelize.query(
      'DELETE FROM grupos WHERE id = :id RETURNING id',
      { replacements: { id } }
    );
    return rows.length > 0;
  }
}

module.exports = { GrupoRepository };