/**
 * Servicio: Visualización de Horarios
 * Consultas de solo lectura para el frontend
 */
const { ScheduleViewRepository } = require('../repositories/schedule-view.repository');
const { NotFoundException } = require('../../../shared/exceptions');

class ScheduleViewService {
  constructor() {
    this.repository = new ScheduleViewRepository();
  }

  async findHorarios(filters) {
    return this.repository.findHorarios(filters);
  }

  async getScheduleView(horarioId, filters) {
    const data = await this.repository.findScheduleView(horarioId, filters);
    // Agrupar por día para facilitar la visualización
    return this._groupByDay(data);
  }

  async getDocenteSchedule(horarioId, docenteId) {
    const data = await this.repository.findByDocente(horarioId, docenteId);
    return this._groupByDay(data);
  }

  async getAulaSchedule(horarioId, aulaId) {
    const data = await this.repository.findByAula(horarioId, aulaId);
    return this._groupByDay(data);
  }

  async getStats(horarioId) {
    return this.repository.getStats(horarioId);
  }

  /** Agrupa asignaciones por día para la vista tipo grilla */
  _groupByDay(asignaciones) {
    const grouped = {};
    for (const a of asignaciones) {
      if (!grouped[a.dia]) grouped[a.dia] = [];
      grouped[a.dia].push(a);
    }
    return grouped;
  }
}

module.exports = { ScheduleViewService };
