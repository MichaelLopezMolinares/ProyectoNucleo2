/**
 * Repositorio: Docentes
 */
const { query } = require('../../../database/pool');
const { Docente } = require('../entities/docente.entity');
const { DocenteDisponibilidad } = require('../entities/disponibilidad.entity');

class TeacherRepository {
  async findAll() {
    const result = await query('SELECT * FROM docentes WHERE activo = TRUE ORDER BY apellido, nombre');
    return result.rows.map(r => new Docente(r));
  }

  async findById(id) {
    const result = await query('SELECT * FROM docentes WHERE id = $1', [id]);
    return result.rows[0] ? new Docente(result.rows[0]) : null;
  }

  async findByCodigo(codigo) {
    const result = await query('SELECT * FROM docentes WHERE codigo = $1', [codigo]);
    return result.rows[0] ? new Docente(result.rows[0]) : null;
  }

  async create({ codigo, nombre, apellido, email, tipoContrato, maxHorasSemana }) {
    const result = await query(
      'INSERT INTO docentes (codigo, nombre, apellido, email, tipo_contrato, max_horas_semana) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [codigo, nombre, apellido, email, tipoContrato, maxHorasSemana]
    );
    return new Docente(result.rows[0]);
  }

  async update(id, { nombre, apellido, email, tipoContrato, maxHorasSemana, activo }) {
    const result = await query(
      'UPDATE docentes SET nombre = COALESCE($1, nombre), apellido = COALESCE($2, apellido), email = COALESCE($3, email), tipo_contrato = COALESCE($4, tipo_contrato), max_horas_semana = COALESCE($5, max_horas_semana), activo = COALESCE($6, activo), updated_at = NOW() WHERE id = $7 RETURNING *',
      [nombre, apellido, email, tipoContrato, maxHorasSemana, activo, id]
    );
    return result.rows[0] ? new Docente(result.rows[0]) : null;
  }

  async delete(id) {
    const result = await query('DELETE FROM docentes WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  // ─── Disponibilidad ─────────────────────────────────────────
  async findDisponibilidad(docenteId) {
    const result = await query(
      'SELECT * FROM docente_disponibilidad WHERE docente_id = $1 ORDER BY dia, hora_inicio',
      [docenteId]
    );
    return result.rows.map(r => new DocenteDisponibilidad(r));
  }

  async addDisponibilidad(docenteId, { dia, horaInicio, horaFin }) {
    const result = await query(
      'INSERT INTO docente_disponibilidad (docente_id, dia, hora_inicio, hora_fin) VALUES ($1, $2, $3, $4) RETURNING *',
      [docenteId, dia, horaInicio, horaFin]
    );
    return new DocenteDisponibilidad(result.rows[0]);
  }

  async removeDisponibilidad(id) {
    const result = await query('DELETE FROM docente_disponibilidad WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  async clearDisponibilidad(docenteId) {
    await query('DELETE FROM docente_disponibilidad WHERE docente_id = $1', [docenteId]);
  }
}

module.exports = { TeacherRepository };
