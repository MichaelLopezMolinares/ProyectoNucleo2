/**
 * Repositorio: Usuarios
 * Módulo: Auth
 * Capa de acceso a datos — solo queries SQL
 */
const { query } = require('../../../database/pool');
const { Usuario } = require('../entities/usuario.entity');

class AuthRepository {
  async findByEmail(email) {
    const result = await query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return result.rows[0] ? new Usuario(result.rows[0]) : null;
  }

  async findById(id) {
    const result = await query('SELECT * FROM usuarios WHERE id = $1', [id]);
    return result.rows[0] ? new Usuario(result.rows[0]) : null;
  }

  async findAll() {
    const result = await query('SELECT * FROM usuarios ORDER BY created_at DESC');
    return result.rows.map(row => new Usuario(row));
  }

  async create({ nombre, email, passwordHash, rol }) {
    const result = await query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, email, passwordHash, rol]
    );
    return new Usuario(result.rows[0]);
  }

  async update(id, { nombre, email, rol, activo }) {
    const result = await query(
      'UPDATE usuarios SET nombre = COALESCE($1, nombre), email = COALESCE($2, email), rol = COALESCE($3, rol), activo = COALESCE($4, activo), updated_at = NOW() WHERE id = $5 RETURNING *',
      [nombre, email, rol, activo, id]
    );
    return result.rows[0] ? new Usuario(result.rows[0]) : null;
  }

  async delete(id) {
    const result = await query('DELETE FROM usuarios WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
}

module.exports = { AuthRepository };
