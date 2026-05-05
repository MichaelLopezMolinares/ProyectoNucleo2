/**
 * Repositorio: Visualización de Horarios — v3
 *
 * FIX PRINCIPAL — filas duplicadas por el OR en el LEFT JOIN:
 *   DISTINCT ON (a.id) garantiza exactamente 1 fila por asignación.
 *   El ORDER BY prioriza match exacto por docente, luego por nombre de asignatura.
 */
const { sequelize } = require('../../../database/sequelize');

class ScheduleViewRepository {

  async findHorarios(filters = {}) {
    let sql = `
      SELECT h.*, pa.codigo AS periodo_codigo, pa.nombre AS periodo_nombre
      FROM horarios h
      JOIN periodos_academicos pa ON h.periodo_id = pa.id
      WHERE 1=1
    `;
    const replacements = {};

    if (filters.periodoId) {
      sql += ' AND h.periodo_id = :periodoId';
      replacements.periodoId = filters.periodoId;
    }
    if (filters.estado) {
      sql += ' AND h.estado = :estado';
      replacements.estado = filters.estado;
    }

    sql += ' ORDER BY h.created_at DESC';
    const [rows] = await sequelize.query(sql, { replacements });
    return rows;
  }

  async findScheduleView(horarioId, filters = {}) {
    let sql = `
      SELECT DISTINCT ON (a.id)
        a.id,
        a.dia,
        a.hora_inicio,
        a.hora_fin,
        g.id              AS grupo_id,
        g.codigo          AS grupo_codigo,
        g.capacidad       AS grupo_capacidad,
        g.jornada,
        asig.id           AS asignatura_id,
        asig.codigo       AS asignatura_codigo,
        asig.nombre       AS asignatura_nombre,
        asig.creditos,
        p.nombre          AS programa_nombre,
        d.nombre          AS docente_nombre,
        d.apellido        AS docente_apellido,
        au.id             AS aula_id,
        au.codigo         AS aula_codigo,
        au.nombre         AS aula_nombre,
        au.edificio       AS aula_edificio,
        au.capacidad      AS aula_capacidad,
        au.tipo           AS aula_tipo
      FROM asignaciones a
      JOIN grupos g ON g.id = a.grupo_id
      LEFT JOIN grupo_asignaturas ga
             ON ga.grupo_id = g.id
            AND ga.activo   = TRUE
            AND (
                  ga.docente_id = a.docente_id
                  OR a.docente_id IS NULL
                )
      LEFT JOIN asignaturas asig ON asig.id = ga.asignatura_id
      LEFT JOIN programas   p    ON p.id    = asig.programa_id
      LEFT JOIN docentes    d    ON d.id    = a.docente_id
      JOIN      aulas       au   ON au.id   = a.aula_id
      WHERE a.horario_id = :horarioId
    `;

    const replacements = { horarioId };

    if (filters.docenteId) {
      sql += ' AND a.docente_id = :docenteId';
      replacements.docenteId = filters.docenteId;
    }
    if (filters.aulaId) {
      sql += ' AND a.aula_id = :aulaId';
      replacements.aulaId = filters.aulaId;
    }
    if (filters.grupoId) {
      sql += ' AND a.grupo_id = :grupoId';
      replacements.grupoId = filters.grupoId;
    }
    if (filters.dia) {
      sql += ' AND a.dia = :dia';
      replacements.dia = filters.dia;
    }
    if (filters.programaId) {
      sql += ' AND p.id = :programaId';
      replacements.programaId = filters.programaId;
    }

    // DISTINCT ON exige que el primer ORDER BY sea la misma columna del DISTINCT
    sql += `
      ORDER BY
        a.id,
        CASE WHEN ga.docente_id = a.docente_id THEN 0 ELSE 1 END,
        asig.nombre,
        a.dia,
        a.hora_inicio
    `;

    const [rows] = await sequelize.query(sql, { replacements });
    return rows;
  }

  async findByDocente(horarioId, docenteId) {
    return this.findScheduleView(horarioId, { docenteId });
  }

  async findByAula(horarioId, aulaId) {
    return this.findScheduleView(horarioId, { aulaId });
  }

  async getStats(horarioId) {
    const [rows] = await sequelize.query(`
      SELECT
        COUNT(*)                   AS total_asignaciones,
        COUNT(DISTINCT docente_id) AS total_docentes,
        COUNT(DISTINCT aula_id)    AS total_aulas,
        COUNT(DISTINCT grupo_id)   AS total_grupos,
        COUNT(DISTINCT dia)        AS dias_usados
      FROM asignaciones
      WHERE horario_id = :horarioId
    `, { replacements: { horarioId } });
    return rows[0];
  }
}

module.exports = { ScheduleViewRepository };