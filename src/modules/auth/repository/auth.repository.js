const { query } = require('../../../config/database');

class AuthRepository {
  async findByEmail(email) {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  }

  async findById(id) {
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async create({ username, email, passwordHash, role }) {
    const { rows } = await query(
      `INSERT INTO users (username, email, password_hash, role, active)
       VALUES ($1, $2, $3, $4, true) RETURNING id, username, email, role, active`,
      [username, email, passwordHash, role]
    );
    return rows[0];
  }
}

module.exports = new AuthRepository();
