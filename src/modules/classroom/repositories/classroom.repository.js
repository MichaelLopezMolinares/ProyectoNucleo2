/**
 * Repositorio: Aulas
 */
const { sequelize } = require('../../../database/sequelize');
const { Aula } = require('../entities/aula.entity');

class ClassroomRepository {
  async findAll(filters = {}) {
    let sql = 'SELECT * FROM aulas WHERE activo = TRUE';
    const replacements = {};

    if (filters.tipo) {
      sql += ' AND tipo = :tipo';
      replacements.tipo = filters.tipo;
    }

    if (filters.capacidadMin) {
      sql += ' AND capacidad >= :capacidadMin';
      replacements.capacidadMin = filters.capacidadMin;
    }

    if (filters.edificio) {
      sql += ' AND edificio = :edificio';
      replacements.edificio = filters.edificio;
    }

    sql += ' ORDER BY edificio, codigo';

    const [rows] = await sequelize.query(sql, {
      replacements
    });

    return rows.map(r => new Aula(r));
  }

  async findById(id) {
    const [rows] = await sequelize.query(
      'SELECT * FROM aulas WHERE id = :id',
      { replacements: { id } }
    );

    return rows[0] ? new Aula(rows[0]) : null;
  }

  async findByCodigo(codigo) {
    const [rows] = await sequelize.query(
      'SELECT * FROM aulas WHERE codigo = :codigo',
      { replacements: { codigo } }
    );

    return rows[0] ? new Aula(rows[0]) : null;
  }

  async findAvailable(dia, horaInicio, horaFin, horarioId) {
    const [rows] = await sequelize.query(
      `SELECT a.* FROM aulas a
       WHERE a.activo = TRUE
       AND a.id NOT IN (
         SELECT asig.aula_id FROM asignaciones asig
         WHERE asig.horario_id = :horarioId
         AND asig.dia = :dia
         AND asig.hora_inicio < :horaFin
         AND asig.hora_fin > :horaInicio
       )
       ORDER BY a.capacidad`,
      {
        replacements: {
          horarioId,
          dia,
          horaInicio,
          horaFin
        }
      }
    );

    return rows.map(r => new Aula(r));
  }

  async create({ codigo, nombre, edificio, capacidad, tipo }) {
    const [rows] = await sequelize.query(
      `INSERT INTO aulas 
       (codigo, nombre, edificio, capacidad, tipo)
       VALUES (:codigo, :nombre, :edificio, :capacidad, :tipo)
       RETURNING *`,
      {
        replacements: {
          codigo,
          nombre,
          edificio,
          capacidad,
          tipo
        }
      }
    );

    return new Aula(rows[0]);
  }

  async update(id, { nombre, edificio, capacidad, tipo, activo }) {
    const [rows] = await sequelize.query(
      `UPDATE aulas 
       SET nombre = COALESCE(:nombre, nombre),
           edificio = COALESCE(:edificio, edificio),
           capacidad = COALESCE(:capacidad, capacidad),
           tipo = COALESCE(:tipo, tipo),
           activo = COALESCE(:activo, activo),
           updated_at = NOW()
       WHERE id = :id
       RETURNING *`,
      {
        replacements: {
          nombre,
          edificio,
          capacidad,
          tipo,
          activo,
          id
        }
      }
    );

    return rows[0] ? new Aula(rows[0]) : null;
  }

  async delete(id) {
    const [rows] = await sequelize.query(
      'DELETE FROM aulas WHERE id = :id',
      { replacements: { id } }
    );

    return rows.length > 0;
  }
}

module.exports = { ClassroomRepository };