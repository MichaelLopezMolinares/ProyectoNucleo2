const { PeriodoRepository } = require('../repositories/periodo.repository');

class PeriodoService {
  constructor() {
    this.repository = new PeriodoRepository(); 
  }

  async findAll() {
    return await this.repository.findAll();
  }

  async findById(id) {
    return await this.repository.findById(id);
  }
}

module.exports = { PeriodoService };