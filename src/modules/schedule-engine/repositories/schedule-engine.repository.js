/**
 * Repositorio: Horarios y Asignaciones
 */
const { sequelize } = require('../../../database/sequelize');
const { Horario } = require('../entities/horario.entity');
const { Asignacion } = require('../entities/asignacion.entity');
const { Conflicto } = require('../entities/conflicto.entity');

class ScheduleEngineRepository {
  // ─── Horarios ───────────────────────────────────────────────
 async createHorario({ periodoId, estrategia, generadoPor }) {
    const [rows] = await sequelize.query(
      `INSERT INTO horarios (periodo_id, estrategia, generado_por)
       VALUES ($1, $2, $3)
       RETURNING *`,
      { bind: [periodoId, estrategia, generadoPor] }
    );

    return new Horario(rows[0]);
  }

 async findHorarioById(id) {
    const [rows] = await sequelize.query(
      'SELECT * FROM horarios WHERE id = $1',
      { bind: [id] }
    );

    return rows[0] ? new Horario(rows[0]) : null;
  }

  async updateHorarioEstado(id, estado) {
    const [rows] = await sequelize.query(
      `UPDATE horarios
       SET estado = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      { bind: [estado, id] }
    );

    return rows[0] ? new Horario(rows[0]) : null;
  }

  async deleteHorario(id) {
    const [result] = await sequelize.query(
      'DELETE FROM horarios WHERE id = $1',
      { bind: [id] }
    );

    return result.rowCount > 0;
  }

  // ─── Asignaciones ──────────────────────────────────────────
 async createAsignacion({ horarioId, grupoId, aulaId, docenteId, dia, horaInicio, horaFin }) {
    const [rows] = await sequelize.query(
      `INSERT INTO asignaciones
      (horario_id, grupo_id, aula_id, docente_id, dia, hora_inicio, hora_fin)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      {
        bind: [horarioId, grupoId, aulaId, docenteId, dia, horaInicio, horaFin]
      }
    );

    return new Asignacion(rows[0]);
  }

  async createAsignacionesBatch(asignaciones) {
    const results = [];

    for (const a of asignaciones) {
      const [rows] = await sequelize.query(
        `INSERT INTO asignaciones
        (horario_id, grupo_id, aula_id, docente_id, dia, hora_inicio, hora_fin)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *`,
        {
          bind: [
            a.horarioId,
            a.grupoId,
            a.aulaId,
            a.docenteId,
            a.dia,
            a.horaInicio,
            a.horaFin
          ]
        }
      );

      results.push(new Asignacion(rows[0]));
    }

    return results;
  }

 async findAsignacionesByHorario(horarioId) {
    const [rows] = await sequelize.query(
      'SELECT * FROM asignaciones WHERE horario_id = $1 ORDER BY dia, hora_inicio',
      { bind: [horarioId] }
    );

    return rows.map(r => new Asignacion(r));
  }

  async deleteAsignacion(id) {
    const [result] = await sequelize.query(
      'DELETE FROM asignaciones WHERE id = $1',
      { bind: [id] }
    );

    return result.rowCount > 0;
  }

  // ─── Conflictos ─────────────────────────────────────────────
  async saveConflictos(horarioId, conflictos) {
    await sequelize.query(
      'DELETE FROM conflictos WHERE horario_id = $1',
      { bind: [horarioId] }
    );

    for (const c of conflictos) {
      await sequelize.query(
        `INSERT INTO conflictos
        (horario_id, tipo, severidad, descripcion, asignacion_a_id, asignacion_b_id)
        VALUES ($1,$2,$3,$4,$5,$6)`,
        {
          bind: [
            horarioId,
            c.tipo,
            c.severidad,
            c.descripcion,
            c.asignacionA || null,
            c.asignacionB || null
          ]
        }
      );
    }
  }

  async findConflictosByHorario(horarioId) {
    const [rows] = await sequelize.query(
      'SELECT * FROM conflictos WHERE horario_id = $1 ORDER BY severidad, tipo',
      { bind: [horarioId] }
    );

    return rows.map(r => new Conflicto(r));
  }
}

module.exports = { ScheduleEngineRepository };