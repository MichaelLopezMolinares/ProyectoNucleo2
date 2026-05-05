const { sequelize } = require('../../../database/sequelize');

class PeriodoRepository {
  async findAll() {
    const [rows] = await sequelize.query(
      'SELECT * FROM periodos_academicos ORDER BY created_at DESC'
    );

    return rows;
  }

  async findById(id) {
    const [rows] = await sequelize.query(
      'SELECT * FROM periodos_academicos WHERE id = :id',
      {
        replacements: { id }
      }
    );

    return rows[0] || null;
  }
}

module.exports = { PeriodoRepository };