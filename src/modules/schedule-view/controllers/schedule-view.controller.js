/**
 * Controlador: Visualización de Horarios
 */
const { ScheduleViewService } = require('../services/schedule-view.service');
const { ScheduleFilterDTO } = require('../dto/schedule-view.dto');
const { ResponseUtil } = require('../../../shared/utils/response.util');

class ScheduleViewController {
  constructor() {
    this.service = new ScheduleViewService();
  }

  /** GET /api/schedules — Listar horarios */
  findAll = async (req, res, next) => {
    try {
      const filters = new ScheduleFilterDTO(req.query);
      const data = await this.service.findHorarios(filters);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  /** GET /api/schedules/:id/view — Vista completa del horario */
  getView = async (req, res, next) => {
    try {
      const filters = new ScheduleFilterDTO(req.query);
      const data = await this.service.getScheduleView(req.params.id, filters);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  /** GET /api/schedules/:id/docente/:docenteId — Horario de un docente */
  getDocenteView = async (req, res, next) => {
    try {
      const data = await this.service.getDocenteSchedule(req.params.id, req.params.docenteId);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  /** GET /api/schedules/:id/aula/:aulaId — Ocupación de un aula */
  getAulaView = async (req, res, next) => {
    try {
      const data = await this.service.getAulaSchedule(req.params.id, req.params.aulaId);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  /** GET /api/schedules/:id/stats — Estadísticas */
  getStats = async (req, res, next) => {
    try {
      const data = await this.service.getStats(req.params.id);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };
}

module.exports = { ScheduleViewController };
