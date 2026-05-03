/**
 * Controlador: Docentes
 */
const { TeacherService } = require('../services/teacher.service');
const { CreateDocenteDTO, UpdateDocenteDTO, DisponibilidadDTO } = require('../dto/teacher.dto');
const { ResponseUtil } = require('../../../shared/utils/response.util');

class TeacherController {
  constructor() {
    this.service = new TeacherService();
  }

  findAll = async (req, res, next) => {
    try {
      const data = await this.service.findAll();
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
      const dto = new CreateDocenteDTO(req.body);
      const data = await this.service.create(dto);
      ResponseUtil.created(res, data);
    } catch (e) { next(e); }
  };

  update = async (req, res, next) => {
    try {
      const dto = new UpdateDocenteDTO(req.body);
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

  // ─── Disponibilidad ─────────────────────────────────────────
  getDisponibilidad = async (req, res, next) => {
    try {
      const data = await this.service.getDisponibilidad(req.params.id);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  setDisponibilidad = async (req, res, next) => {
    try {
      const disponibilidades = req.body.map(d => new DisponibilidadDTO(d));
      const data = await this.service.setDisponibilidad(req.params.id, disponibilidades);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };
}

module.exports = { TeacherController };
