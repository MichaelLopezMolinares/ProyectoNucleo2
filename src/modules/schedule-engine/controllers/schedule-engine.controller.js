/**
 * Controlador: Motor de Generación de Horarios
 */
const { ScheduleGeneratorService } = require('../services/schedule-generator.service');
const { GenerateScheduleDTO } = require('../dto/schedule-engine.dto');
const { ResponseUtil } = require('../../../shared/utils/response.util');

class ScheduleEngineController {
  constructor() {
    this.service = new ScheduleGeneratorService();
  }

  /** POST /api/schedule-engine/generate — Generar horario */
  generate = async (req, res, next) => {
    try {
      const dto = new GenerateScheduleDTO({
        ...req.body,
        userId: req.user.id,
      });
      const result = await this.service.generateSchedule(dto);
      ResponseUtil.created(res, result);
    } catch (e) { next(e); }
  };

  /** GET /api/schedule-engine/strategies — Estrategias disponibles */
  getStrategies = async (req, res, next) => {
    try {
      const strategies = this.service.getAvailableStrategies();
      ResponseUtil.success(res, { strategies });
    } catch (e) { next(e); }
  };

  /** GET /api/schedule-engine/:id — Detalle del horario */
  getDetail = async (req, res, next) => {
    try {
      const data = await this.service.getHorarioDetail(req.params.id);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  /** PUT /api/schedule-engine/:id/publish — Publicar horario */
  publish = async (req, res, next) => {
    try {
      const data = await this.service.publishHorario(req.params.id);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };
}

module.exports = { ScheduleEngineController };
