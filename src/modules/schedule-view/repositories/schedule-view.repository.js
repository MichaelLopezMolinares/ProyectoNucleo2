/**
 * Repositorio: Visualización de Horarios — v2 (multi-asignatura)
 *
 * CAMBIO PRINCIPAL:
 *   La asignatura ya no está en `grupos.asignatura_id` sino en
 *   la tabla `grupo_asignaturas`. El JOIN se actualiza:
 *
 *   ANTES:
 *     JOIN asignaturas asig ON g.asignatura_id = asig.id   ← columna eliminada
 *
 *   AHORA:
 *     JOIN grupo_asignaturas ga ON ga.grupo_id = g.id
 *                               AND ga.docente_id = a.docente_id
 *     JOIN asignaturas asig ON asig.id = ga.asignatura_id
 *
 *   El match docente_id entre asignacion y grupo_asignatura permite
 *   identificar exactamente QUÉ asignatura corresponde a la asignación,
 *   ya que un grupo puede tener múltiples asignaturas con distintos docentes.
 *
 *   Fallback: si el docente es NULL (grupos sin docente), se hace LEFT JOIN
 *   y se toma la primera asignatura activa del grupo.
 *
 * OTRO CAMBIO:
 *   Migrado de bind/$N a replacements/:param para consistencia con el
 *   resto del proyecto (schedule-engine.repository, grupo.repository, etc.)
 */
const { sequelize } = require('../../../database/sequelize');

class ScheduleViewRepository {

  /**
   * Obtiene horarios con datos del periodo académico
   */
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

  /**
   * Vista completa de asignaciones con datos enriquecidos.
   *
   * El JOIN con grupo_asignaturas usa:
   *   1. ga.grupo_id = g.id          → asignaturas de ese grupo
   *   2. ga.docente_id = a.docente_id → la asignatura que corresponde
   *                                     a ese docente específico
   *
   * Si la asignación no tiene docente (docente_id IS NULL), usamos
   * DISTINCT ON para tomar solo una asignatura por grupo (la primera).
   */
  async findScheduleView(horarioId, filters = {}) {
    let sql = `
      SELECT
        a.id,
        a.dia,
        a.hora_inicio,
        a.hora_fin,
        g.codigo          AS grupo_codigo,
        g.capacidad       AS grupo_capacidad,
        g.jornada,
        asig.codigo       AS asignatura_codigo,
        asig.nombre       AS asignatura_nombre,
        asig.creditos,
        p.nombre          AS programa_nombre,
        d.nombre          AS docente_nombre,
        d.apellido        AS docente_apellido,
        au.codigo         AS aula_codigo,
        au.nombre         AS aula_nombre,
        au.edificio       AS aula_edificio,
        au.capacidad      AS aula_capacidad,
        au.tipo           AS aula_tipo
      FROM asignaciones a
      JOIN grupos g ON g.id = a.grupo_id
      LEFT JOIN grupo_asignaturas ga
             ON ga.grupo_id   = g.id
            AND (
                  -- Caso normal: la asignación tiene docente → match exacto
                  ga.docente_id = a.docente_id
                  OR
                  -- Fallback: sin docente → tomar cualquier asignatura activa del grupo
                  (a.docente_id IS NULL AND ga.activo = TRUE)
                )
      LEFT JOIN asignaturas asig ON asig.id = ga.asignatura_id
      LEFT JOIN programas   p    ON p.id    = asig.programa_id
      LEFT JOIN docentes    d    ON d.id    = a.docente_id
      JOIN aulas au ON au.id = a.aula_id
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

    sql += ' ORDER BY a.dia, a.hora_inicio';

    const [rows] = await sequelize.query(sql, { replacements });
    return rows;
  }

  /**
   * Horario de un docente específico
   */
  async findByDocente(horarioId, docenteId) {
    return this.findScheduleView(horarioId, { docenteId });
  }

  /**
   * Ocupación de un aula
   */
  async findByAula(horarioId, aulaId) {
    return this.findScheduleView(horarioId, { aulaId });
  }

  /**
   * Estadísticas de un horario
   */
  async getStats(horarioId) {
    const [rows] = await sequelize.query(`
      SELECT
        COUNT(*)                  AS total_asignaciones,
        COUNT(DISTINCT docente_id) AS total_docentes,
        COUNT(DISTINCT aula_id)   AS total_aulas,
        COUNT(DISTINCT grupo_id)  AS total_grupos,
        COUNT(DISTINCT dia)       AS dias_usados
      FROM asignaciones
      WHERE horario_id = :horarioId
    `, { replacements: { horarioId } });

    return rows[0];
  }
}

module.exports = { ScheduleViewRepository };