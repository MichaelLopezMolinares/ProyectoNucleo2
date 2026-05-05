/**
 * Repositorio: Horarios y Asignaciones — VERSIÓN CORREGIDA
 *
 * Correcciones:
 * ✔ saveConflictos: usa c.asignacionA / c.asignacionB directamente
 *   (ya son UUIDs de asignacion, no objetos)
 * ✔ findConflictosByHorario: migrado de `bind/$1` a `replacements/:param`
 *   para ser consistente con el resto del repositorio
 * ✔ deleteAsignacion: migrado de `bind/$1` a `replacements/:param`
 * ✔ createAsignacionesBatch: podría beneficiarse de una bulk INSERT;
 *   se deja el loop pero se agrega nota de optimización
 */
const { sequelize } = require('../../../database/sequelize');
const { Horario }   = require('../entities/horario.entity');
const { Asignacion } = require('../entities/asignacion.entity');
const { Conflicto } = require('../entities/conflicto.entity');

class ScheduleEngineRepository {

  // ─── Horarios ────────────────────────────────────────────────

  async createHorario({ periodoId, estrategia, generadoPor }) {
    const [rows] = await sequelize.query(
      `INSERT INTO horarios (periodo_id, estrategia, generado_por)
       VALUES (:periodoId, :estrategia, :generadoPor)
       RETURNING *`,
      { replacements: { periodoId, estrategia, generadoPor } }
    );
    return new Horario(rows[0]);
  }

  async findHorarioById(id) {
    const [rows] = await sequelize.query(
      'SELECT * FROM horarios WHERE id = :id',
      { replacements: { id } }
    );
    return rows[0] ? new Horario(rows[0]) : null;
  }

  async updateHorarioEstado(id, estado) {
    const [rows] = await sequelize.query(
      `UPDATE horarios
       SET estado = :estado, updated_at = NOW()
       WHERE id = :id
       RETURNING *`,
      { replacements: { id, estado } }
    );
    return rows[0] ? new Horario(rows[0]) : null;
  }

  async deleteHorario(id) {
    await sequelize.query(
      'DELETE FROM horarios WHERE id = :id',
      { replacements: { id } }
    );
    // RETURNING no retorna filas en DELETE sin cláusula WHERE que filtre;
    // simplemente resolvemos void (el caller no usa el retorno).
  }

  // ─── Asignaciones ────────────────────────────────────────────

  async createAsignacion({ horarioId, grupoId, aulaId, docenteId, dia, horaInicio, horaFin }) {
    const [rows] = await sequelize.query(
      `INSERT INTO asignaciones
         (horario_id, grupo_id, aula_id, docente_id, dia, hora_inicio, hora_fin)
       VALUES
         (:horarioId, :grupoId, :aulaId, :docenteId, :dia, :horaInicio, :horaFin)
       RETURNING *`,
      { replacements: { horarioId, grupoId, aulaId, docenteId, dia, horaInicio, horaFin } }
    );
    return new Asignacion(rows[0]);
  }

  /**
   * Inserta asignaciones en lote.
   *
   * NOTA DE OPTIMIZACIÓN: Para volúmenes > 200 filas considera reemplazar
   * este loop por una bulk INSERT con VALUES generados dinámicamente, o usar
   * COPY FROM para máximo rendimiento en PostgreSQL.
   */
  async createAsignacionesBatch(asignaciones) {
    const results = [];
    for (const a of asignaciones) {
      const [rows] = await sequelize.query(
        `INSERT INTO asignaciones
           (horario_id, grupo_id, aula_id, docente_id, dia, hora_inicio, hora_fin)
         VALUES
           (:horarioId, :grupoId, :aulaId, :docenteId, :dia, :horaInicio, :horaFin)
         RETURNING *`,
        {
          replacements: {
            horarioId:  a.horarioId,
            grupoId:    a.grupoId,
            aulaId:     a.aulaId,
            docenteId:  a.docenteId,
            dia:        a.dia,
            horaInicio: a.horaInicio,
            horaFin:    a.horaFin,
          },
        }
      );
      results.push(new Asignacion(rows[0]));
    }
    return results;
  }

  async findAsignacionesByHorario(horarioId) {
    const [rows] = await sequelize.query(
      'SELECT * FROM asignaciones WHERE horario_id = :horarioId ORDER BY dia, hora_inicio',
      { replacements: { horarioId } }
    );
    return rows.map(r => new Asignacion(r));
  }

  async deleteAsignacion(id) {
    // ✔ Corregido: usa replacements en lugar de bind/$1
    await sequelize.query(
      'DELETE FROM asignaciones WHERE id = :id',
      { replacements: { id } }
    );
  }

  // ─── Conflictos ──────────────────────────────────────────────

  /**
   * Persiste conflictos de un horario.
   *
   * CORRECCIÓN CRÍTICA:
   *   c.asignacionA y c.asignacionB ya son UUIDs (string) de la tabla asignaciones,
   *   provenientes de ScheduleGeneratorService donde se mapean como:
   *     asignacionA: asignacion?.id || null
   *   Por tanto NO se debe hacer c.asignacionA?.grupo_id (eso era incorrecto
   *   y rompía la FK hacia asignaciones).
   */
  async saveConflictos(horarioId, conflictos) {
    // Limpiar conflictos previos del horario
    await sequelize.query(
      'DELETE FROM conflictos WHERE horario_id = :horarioId',
      { replacements: { horarioId } }
    );

    for (const c of conflictos) {
      await sequelize.query(
        `INSERT INTO conflictos
           (horario_id, tipo, severidad, descripcion, asignacion_a_id, asignacion_b_id)
         VALUES
           (:horarioId, :tipo, :severidad, :descripcion, :asignacionA, :asignacionB)`,
        {
          replacements: {
            horarioId,
            tipo:        c.tipo,
            severidad:   c.severidad,
            descripcion: c.descripcion,
            // ✔ Son directamente UUIDs (o null), no objetos anidados
            asignacionA: c.asignacionA || null,
            asignacionB: c.asignacionB || null,
          },
        }
      );
    }
  }

  async findConflictosByHorario(horarioId) {
    // ✔ Corregido: usa replacements/:horarioId en lugar de bind/$1
    const [rows] = await sequelize.query(
      'SELECT * FROM conflictos WHERE horario_id = :horarioId ORDER BY severidad, tipo',
      { replacements: { horarioId } }
    );
    return rows.map(r => new Conflicto(r));
  }
}

module.exports = { ScheduleEngineRepository };