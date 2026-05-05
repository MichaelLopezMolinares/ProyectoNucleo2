/**
 * Repositorio: Docentes
 */
const { sequelize } = require('../../../database/sequelize');
const { Docente } = require('../entities/docente.entity');
const { DocenteDisponibilidad } = require('../entities/disponibilidad.entity');

class TeacherRepository {
  async findAll() {
  const [rows] = await sequelize.query(
    'SELECT * FROM docentes WHERE activo = TRUE ORDER BY apellido, nombre'
  );

  return rows.map(r => new Docente(r));
}

async findById(id) {
  const [rows] = await sequelize.query(
    'SELECT * FROM docentes WHERE id = :id',
    {
      replacements: { id }
    }
  );

  return rows[0] ? new Docente(rows[0]) : null;
}

async findByCodigo(codigo) {
  const [rows] = await sequelize.query(
    'SELECT * FROM docentes WHERE codigo = :codigo',
    {
      replacements: { codigo }
    }
  );

  return rows[0] ? new Docente(rows[0]) : null;
}

 async create({ codigo, nombre, apellido, email, tipoContrato, maxHorasSemana }) {
  const [rows] = await sequelize.query(
    `INSERT INTO docentes 
    (codigo, nombre, apellido, email, tipo_contrato, max_horas_semana)
    VALUES (:codigo, :nombre, :apellido, :email, :tipoContrato, :maxHorasSemana)
    RETURNING *`,
    {
      replacements: {
        codigo,
        nombre,
        apellido,
        email,
        tipoContrato,
        maxHorasSemana
      }
    }
  );

  return new Docente(rows[0]);
}

 async update(id, { nombre, apellido, email, tipoContrato, maxHorasSemana, activo }) {
  const [rows] = await sequelize.query(
    `UPDATE docentes 
     SET nombre = COALESCE(:nombre, nombre),
         apellido = COALESCE(:apellido, apellido),
         email = COALESCE(:email, email),
         tipo_contrato = COALESCE(:tipoContrato, tipo_contrato),
         max_horas_semana = COALESCE(:maxHorasSemana, max_horas_semana),
         activo = COALESCE(:activo, activo),
         updated_at = NOW()
     WHERE id = :id
     RETURNING *`,
    {
      replacements: {
        id,
        nombre,
        apellido,
        email,
        tipoContrato,
        maxHorasSemana,
        activo
      }
    }
  );

  return rows[0] ? new Docente(rows[0]) : null;
}

 async delete(id) {
  const [rows] = await sequelize.query(
    'DELETE FROM docentes WHERE id = :id',
    {
      replacements: { id }
    }
  );

  return rows.length > 0;
}

  // ─── Disponibilidad ─────────────────────────────────────────
async findDisponibilidad(docenteId) {
  const [rows] = await sequelize.query(
    `SELECT * FROM docente_disponibilidad 
     WHERE docente_id = :docenteId 
     ORDER BY dia, hora_inicio`,
    {
      replacements: { docenteId }
    }
  );

  return rows.map(r => new DocenteDisponibilidad(r));
}

  async addDisponibilidad(docenteId, { dia, horaInicio, horaFin }) {
  const [rows] = await sequelize.query(
    `INSERT INTO docente_disponibilidad 
    (docente_id, dia, hora_inicio, hora_fin)
    VALUES (:docenteId, :dia, :horaInicio, :horaFin)
    RETURNING *`,
    {
      replacements: {
        docenteId,
        dia,
        horaInicio,
        horaFin
      }
    }
  );

  return new DocenteDisponibilidad(rows[0]);
}

  async removeDisponibilidad(id) {
  const [rows] = await sequelize.query(
    'DELETE FROM docente_disponibilidad WHERE id = :id',
    {
      replacements: { id }
    }
  );

  return rows.length > 0;
}

async clearDisponibilidad(docenteId) {
  await sequelize.query(
    'DELETE FROM docente_disponibilidad WHERE docente_id = :docenteId',
    {
      replacements: { docenteId }
    }
  );
}
}

module.exports = { TeacherRepository };
