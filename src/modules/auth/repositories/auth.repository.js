/**
 * Repositorio: Usuarios
 * Módulo: Auth
 * Capa de acceso a datos — usando Sequelize
 */
const { sequelize } = require('../../../database/sequelize');
const { QueryTypes } = require('sequelize');
const { Usuario } = require('../entities/usuario.entity');

class AuthRepository {
  async findByEmail(email) {
    const result = await sequelize.query(
      'SELECT * FROM usuarios WHERE email = :email',
      {
        replacements: { email },
        type: QueryTypes.SELECT
      }
    );

    return result[0] ? new Usuario(result[0]) : null;
  }

  async findById(id) {
    const result = await sequelize.query(
      'SELECT * FROM usuarios WHERE id = :id',
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    return result[0] ? new Usuario(result[0]) : null;
  }

  async findAll() {
    const result = await sequelize.query(
      'SELECT * FROM usuarios ORDER BY created_at DESC',
      {
        type: QueryTypes.SELECT
      }
    );

    return result.map(row => new Usuario(row));
  }

  async create({ nombre, email, passwordHash, rol }) {
    const result = await sequelize.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol) 
       VALUES (:nombre, :email, :passwordHash, :rol) 
       RETURNING *`,
      {
        replacements: { nombre, email, passwordHash, rol },
        type: QueryTypes.INSERT
      }
    );

    return result[0][0] ? new Usuario(result[0][0]) : null;
  }

  async update(id, { nombre, email, rol, activo }) {
    const result = await sequelize.query(
      `UPDATE usuarios 
       SET nombre = COALESCE(:nombre, nombre),
           email = COALESCE(:email, email),
           rol = COALESCE(:rol, rol),
           activo = COALESCE(:activo, activo),
           updated_at = NOW()
       WHERE id = :id 
       RETURNING *`,
      {
        replacements: { nombre, email, rol, activo, id },
        type: QueryTypes.UPDATE
      }
    );

    return result[0][0] ? new Usuario(result[0][0]) : null;
  }

async delete(id) {
  await sequelize.query(
    'DELETE FROM usuarios WHERE id = :id',
    {
      replacements: { id },
      type: QueryTypes.DELETE
    }
  );

  return true; 
}
}

module.exports = { AuthRepository };