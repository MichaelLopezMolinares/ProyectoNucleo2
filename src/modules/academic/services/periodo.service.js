const { sequelize } = require('../../../database/sequelize');

class PeriodoService {
  async findAll() {
    const [rows] = await sequelize.query(
      'SELECT * FROM periodos_academicos ORDER BY fecha_inicio DESC'
    );
    return rows;
  }
}

module.exports = { PeriodoService };