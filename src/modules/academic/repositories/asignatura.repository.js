/**
 * Repositorio: Asignaturas
 */
const { sequelize } = require('../../../database/sequelize');
const { Asignatura } = require('../entities/asignatura.entity');

class AsignaturaRepository {
  async findAll(programaId = null) {
    let sql = 'SELECT * FROM asignaturas WHERE activo = TRUE';
    const replacements = {};

    if (programaId) {
      sql += ' AND programa_id = :programaId';
      replacements.programaId = programaId;
    }

    sql += ' ORDER BY semestre, nombre';

    const [rows] = await sequelize.query(sql, {
      replacements
    });

    return rows.map(r => new Asignatura(r));
  }

  async findById(id) {
    const [rows] = await sequelize.query(
      'SELECT * FROM asignaturas WHERE id = :id',
      { replacements: { id } }
    );

    return rows[0] ? new Asignatura(rows[0]) : null;
  }

  async findByCodigo(codigo) {
    const [rows] = await sequelize.query(
      'SELECT * FROM asignaturas WHERE codigo = :codigo',
      { replacements: { codigo } }
    );

    return rows[0] ? new Asignatura(rows[0]) : null;
  }

  async create({ codigo, nombre, creditos, horasSemanales, semestre, programaId }) {
    const [rows] = await sequelize.query(
      `INSERT INTO asignaturas 
      (codigo, nombre, creditos, horas_semanales, semestre, programa_id) 
      VALUES (:codigo, :nombre, :creditos, :horasSemanales, :semestre, :programaId)
      RETURNING *`,
      {
        replacements: {
          codigo,
          nombre,
          creditos,
          horasSemanales,
          semestre,
          programaId
        }
      }
    );

    return new Asignatura(rows[0]);
  }

  async update(id, { nombre, creditos, horasSemanales, semestre, activo }) {
    const [rows] = await sequelize.query(
      `UPDATE asignaturas 
       SET nombre = COALESCE(:nombre, nombre),
           creditos = COALESCE(:creditos, creditos),
           horas_semanales = COALESCE(:horasSemanales, horas_semanales),
           semestre = COALESCE(:semestre, semestre),
           activo = COALESCE(:activo, activo),
           updated_at = NOW()
       WHERE id = :id
       RETURNING *`,
      {
        replacements: {
          nombre,
          creditos,
          horasSemanales,
          semestre,
          activo,
          id
        }
      }
    );

    return rows[0] ? new Asignatura(rows[0]) : null;
  }

  async delete(id) {
    const [rows] = await sequelize.query(
      'DELETE FROM asignaturas WHERE id = :id',
      { replacements: { id } }
    );

    return rows.length > 0;
  }
}

module.exports = { AsignaturaRepository };