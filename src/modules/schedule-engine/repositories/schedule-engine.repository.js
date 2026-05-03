/**
 * Repositorio: Horarios y Asignaciones
 */
const { query, getClient } = require('../../../database/pool');
const { Horario } = require('../entities/horario.entity');
const { Asignacion } = require('../entities/asignacion.entity');
const { Conflicto } = require('../entities/conflicto.entity');

class ScheduleEngineRepository {
  // ─── Horarios ───────────────────────────────────────────────
  async createHorario({ periodoId, estrategia, generadoPor }) {
    const result = await query(
      'INSERT INTO horarios (periodo_id, estrategia, generado_por) VALUES ($1, $2, $3) RETURNING *',
      [periodoId, estrategia, generadoPor]
    );
    return new Horario(result.rows[0]);
  }

  async findHorarioById(id) {
    const result = await query('SELECT * FROM horarios WHERE id = $1', [id]);
    return result.rows[0] ? new Horario(result.rows[0]) : null;
  }

  async updateHorarioEstado(id, estado) {
    const result = await query(
      'UPDATE horarios SET estado = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [estado, id]
    );
    return result.rows[0] ? new Horario(result.rows[0]) : null;
  }

  async deleteHorario(id) {
    const result = await query('DELETE FROM horarios WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  // ─── Asignaciones ──────────────────────────────────────────
  async createAsignacion({ horarioId, grupoId, aulaId, docenteId, dia, horaInicio, horaFin }) {
    const result = await query(
      'INSERT INTO asignaciones (horario_id, grupo_id, aula_id, docente_id, dia, hora_inicio, hora_fin) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [horarioId, grupoId, aulaId, docenteId, dia, horaInicio, horaFin]
    );
    return new Asignacion(result.rows[0]);
  }

  async createAsignacionesBatch(asignaciones) {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const results = [];
      for (const a of asignaciones) {
        const result = await client.query(
          'INSERT INTO asignaciones (horario_id, grupo_id, aula_id, docente_id, dia, hora_inicio, hora_fin) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
          [a.horarioId, a.grupoId, a.aulaId, a.docenteId, a.dia, a.horaInicio, a.horaFin]
        );
        results.push(new Asignacion(result.rows[0]));
      }
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findAsignacionesByHorario(horarioId) {
    const result = await query(
      'SELECT * FROM asignaciones WHERE horario_id = $1 ORDER BY dia, hora_inicio',
      [horarioId]
    );
    return result.rows.map(r => new Asignacion(r));
  }

  async deleteAsignacion(id) {
    const result = await query('DELETE FROM asignaciones WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  // ─── Conflictos ─────────────────────────────────────────────
  async saveConflictos(horarioId, conflictos) {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      // Limpiar conflictos anteriores
      await client.query('DELETE FROM conflictos WHERE horario_id = $1', [horarioId]);

      for (const c of conflictos) {
        await client.query(
          'INSERT INTO conflictos (horario_id, tipo, severidad, descripcion, asignacion_a_id, asignacion_b_id) VALUES ($1, $2, $3, $4, $5, $6)',
          [horarioId, c.tipo, c.severidad, c.descripcion, c.asignacionA || null, c.asignacionB || null]
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findConflictosByHorario(horarioId) {
    const result = await query(
      'SELECT * FROM conflictos WHERE horario_id = $1 ORDER BY severidad, tipo',
      [horarioId]
    );
    return result.rows.map(r => new Conflicto(r));
  }
}

module.exports = { ScheduleEngineRepository };
