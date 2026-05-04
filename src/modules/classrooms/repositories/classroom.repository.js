/**
 * Repositorio: Aulas
 */
const { query } = require('../../../database/pool');
const { Aula } = require('../entities/aula.entity');

class ClassroomRepository {
  async findAll(filters = {}) {
    let sql = 'SELECT * FROM aulas WHERE activo = TRUE';
    const params = [];
    let idx = 1;

    if (filters.tipo) {
      sql += ` AND tipo = $${idx++}`;
      params.push(filters.tipo);
    }
    if (filters.capacidadMin) {
      sql += ` AND capacidad >= $${idx++}`;
      params.push(filters.capacidadMin);
    }
    if (filters.edificio) {
      sql += ` AND edificio = $${idx++}`;
      params.push(filters.edificio);
    }

    sql += ' ORDER BY edificio, codigo';
    const result = await query(sql, params);
    return result.rows.map(r => new Aula(r));
  }

  async findById(id) {
    const result = await query('SELECT * FROM aulas WHERE id = $1', [id]);
    return result.rows[0] ? new Aula(result.rows[0]) : null;
  }

  async findByCodigo(codigo) {
    const result = await query('SELECT * FROM aulas WHERE codigo = $1', [codigo]);
    return result.rows[0] ? new Aula(result.rows[0]) : null;
  }

  async findAvailable(dia, horaInicio, horaFin, horarioId) {
    const result = await query(
      `SELECT a.* FROM aulas a
       WHERE a.activo = TRUE
       AND a.id NOT IN (
         SELECT asig.aula_id FROM asignaciones asig
         WHERE asig.horario_id = $1
         AND asig.dia = $2
         AND asig.hora_inicio < $4
         AND asig.hora_fin > $3
       )
       ORDER BY a.capacidad`,
      [horarioId, dia, horaInicio, horaFin]
    );
    return result.rows.map(r => new Aula(r));
  }

  async create({ codigo, nombre, edificio, capacidad, tipo }) {
    const result = await query(
      'INSERT INTO aulas (codigo, nombre, edificio, capacidad, tipo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [codigo, nombre, edificio, capacidad, tipo]
    );
    return new Aula(result.rows[0]);
  }

  async update(id, { nombre, edificio, capacidad, tipo, activo }) {
    const result = await query(
      'UPDATE aulas SET nombre = COALESCE($1, nombre), edificio = COALESCE($2, edificio), capacidad = COALESCE($3, capacidad), tipo = COALESCE($4, tipo), activo = COALESCE($5, activo), updated_at = NOW() WHERE id = $6 RETURNING *',
      [nombre, edificio, capacidad, tipo, activo, id]
    );
    return result.rows[0] ? new Aula(result.rows[0]) : null;
  }

  async delete(id) {
    const result = await query('DELETE FROM aulas WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

module.exports = { ClassroomRepository };
