/**
 * Controlador: Aulas
 */
const { ClassroomService } = require('../services/classroom.service');
const { CreateAulaDTO, UpdateAulaDTO } = require('../dto/classroom.dto');
const { ResponseUtil } = require('../../../shared/utils/response.util');

class ClassroomController {
  constructor() {
    this.service = new ClassroomService();
  }

  findAll = async (req, res, next) => {
    try {
      const filters = {
        tipo: req.query.tipo,
        capacidadMin: req.query.capacidadMin ? parseInt(req.query.capacidadMin) : undefined,
        edificio: req.query.edificio,
      };
      const data = await this.service.findAll(filters);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  findById = async (req, res, next) => {
    try {
      const data = await this.service.findById(req.params.id);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  create = async (req, res, next) => {
    try {
      const dto = new CreateAulaDTO(req.body);
      const data = await this.service.create(dto);
      ResponseUtil.created(res, data);
    } catch (e) { next(e); }
  };

  update = async (req, res, next) => {
    try {
      const dto = new UpdateAulaDTO(req.body);
      const data = await this.service.update(req.params.id, dto);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  delete = async (req, res, next) => {
    try {
      await this.service.delete(req.params.id);
      ResponseUtil.noContent(res);
    } catch (e) { next(e); }
  };
}

module.exports = { ClassroomController };
