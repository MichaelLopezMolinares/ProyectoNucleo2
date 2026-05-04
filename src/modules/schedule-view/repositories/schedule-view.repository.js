/**
 * Repositorio: Visualización de Horarios
 * Consultas de solo lectura optimizadas con JOINs para la API de visualización
 */
const { query } = require('../../../database/pool');

class ScheduleViewRepository {
  /**
   * Obtiene horarios publicados con filtros
   */
  async findHorarios(filters = {}) {
    let sql = 'SELECT h.*, pa.codigo as periodo_codigo, pa.nombre as periodo_nombre FROM horarios h JOIN periodos_academicos pa ON h.periodo_id = pa.id WHERE 1=1';
    const params = [];
    let idx = 1;

    if (filters.periodoId) {
      sql += ` AND h.periodo_id = $${idx++}`;
      params.push(filters.periodoId);
    }
    if (filters.estado) {
      sql += ` AND h.estado = $${idx++}`;
      params.push(filters.estado);
    }

    sql += ' ORDER BY h.created_at DESC';
    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Vista completa de asignaciones con datos enriquecidos
   * JOINs con asignaturas, docentes, aulas, programas
   */
  async findScheduleView(horarioId, filters = {}) {
    let sql = `
      SELECT
        a.id,
        a.dia,
        a.hora_inicio,
        a.hora_fin,
        g.codigo AS grupo_codigo,
        g.capacidad AS grupo_capacidad,
        g.jornada,
        asig.codigo AS asignatura_codigo,
        asig.nombre AS asignatura_nombre,
        asig.creditos,
        p.nombre AS programa_nombre,
        d.nombre AS docente_nombre,
        d.apellido AS docente_apellido,
        au.codigo AS aula_codigo,
        au.nombre AS aula_nombre,
        au.edificio AS aula_edificio,
        au.capacidad AS aula_capacidad,
        au.tipo AS aula_tipo
      FROM asignaciones a
      JOIN grupos g ON a.grupo_id = g.id
      JOIN asignaturas asig ON g.asignatura_id = asig.id
      JOIN programas p ON asig.programa_id = p.id
      JOIN docentes d ON a.docente_id = d.id
      JOIN aulas au ON a.aula_id = au.id
      WHERE a.horario_id = $1
    `;
    const params = [horarioId];
    let idx = 2;

    if (filters.docenteId) {
      sql += ` AND a.docente_id = $${idx++}`;
      params.push(filters.docenteId);
    }
    if (filters.aulaId) {
      sql += ` AND a.aula_id = $${idx++}`;
      params.push(filters.aulaId);
    }
    if (filters.grupoId) {
      sql += ` AND a.grupo_id = $${idx++}`;
      params.push(filters.grupoId);
    }
    if (filters.dia) {
      sql += ` AND a.dia = $${idx++}`;
      params.push(filters.dia);
    }
    if (filters.programaId) {
      sql += ` AND p.id = $${idx++}`;
      params.push(filters.programaId);
    }

    sql += ' ORDER BY a.dia, a.hora_inicio';
    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Obtiene el horario de un docente específico
   */
  async findByDocente(horarioId, docenteId) {
    return this.findScheduleView(horarioId, { docenteId });
  }

  /**
   * Obtiene la ocupación de un aula
   */
  async findByAula(horarioId, aulaId) {
    return this.findScheduleView(horarioId, { aulaId });
  }

  /**
   * Estadísticas de un horario
   */
  async getStats(horarioId) {
    const result = await query(`
      SELECT
        COUNT(*) AS total_asignaciones,
        COUNT(DISTINCT docente_id) AS total_docentes,
        COUNT(DISTINCT aula_id) AS total_aulas,
        COUNT(DISTINCT grupo_id) AS total_grupos,
        COUNT(DISTINCT dia) AS dias_usados
      FROM asignaciones
      WHERE horario_id = $1
    `, [horarioId]);
    return result.rows[0];
  }
}

module.exports = { ScheduleViewRepository };
