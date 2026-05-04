/**
 * Controlador: Gestión Académica
 * Maneja programas, asignaturas y grupos
 */
const { ProgramaService } = require('../services/programa.service');
const { AsignaturaService } = require('../services/asignatura.service');
const { GrupoService } = require('../services/grupo.service');
const { ResponseUtil } = require('../../../shared/utils/response.util');
const { PeriodoService } = require('../services/periodo.service');
const {
  CreateProgramaDTO, UpdateProgramaDTO,
  CreateAsignaturaDTO, UpdateAsignaturaDTO,
  CreateGrupoDTO, UpdateGrupoDTO,
} = require('../dto/academic.dto');

class AcademicController {
  constructor() {
    this.programaService = new ProgramaService();
    this.asignaturaService = new AsignaturaService();
    this.grupoService = new GrupoService();
    this.periodoService = new PeriodoService();
  }

  // ─── Programas ──────────────────────────────────────────────
  findAllProgramas = async (req, res, next) => {
    try {
      const data = await this.programaService.findAll();
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  findProgramaById = async (req, res, next) => {
    try {
      const data = await this.programaService.findById(req.params.id);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  createPrograma = async (req, res, next) => {
    try {
      const dto = new CreateProgramaDTO(req.body);
      const data = await this.programaService.create(dto);
      ResponseUtil.created(res, data);
    } catch (e) { next(e); }
  };

  updatePrograma = async (req, res, next) => {
    try {
      const dto = new UpdateProgramaDTO(req.body);
      const data = await this.programaService.update(req.params.id, dto);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  deletePrograma = async (req, res, next) => {
    try {
      await this.programaService.delete(req.params.id);
      ResponseUtil.noContent(res);
    } catch (e) { next(e); }
  };

getPeriodos = async (req, res, next) => {
  try {
    const data = await this.periodoService.findAll();
    ResponseUtil.success(res, data);
  } catch (e) {
    next(e);
  }
};
  // ─── Asignaturas ────────────────────────────────────────────
  findAllAsignaturas = async (req, res, next) => {
    try {
      const data = await this.asignaturaService.findAll(req.query.programaId);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  findAsignaturaById = async (req, res, next) => {
    try {
      const data = await this.asignaturaService.findById(req.params.id);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  createAsignatura = async (req, res, next) => {
    try {
      const dto = new CreateAsignaturaDTO(req.body);
      const data = await this.asignaturaService.create(dto);
      ResponseUtil.created(res, data);
    } catch (e) { next(e); }
  };

  updateAsignatura = async (req, res, next) => {
    try {
      const dto = new UpdateAsignaturaDTO(req.body);
      const data = await this.asignaturaService.update(req.params.id, dto);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  deleteAsignatura = async (req, res, next) => {
    try {
      await this.asignaturaService.delete(req.params.id);
      ResponseUtil.noContent(res);
    } catch (e) { next(e); }
  };

  // ─── Grupos ─────────────────────────────────────────────────
  findAllGrupos = async (req, res, next) => {
    try {
      const filters = {
        asignaturaId: req.query.asignaturaId,
        periodo: req.query.periodo,
        docenteId: req.query.docenteId,
      };
      const data = await this.grupoService.findAll(filters);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  findGrupoById = async (req, res, next) => {
    try {
      const data = await this.grupoService.findById(req.params.id);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  createGrupo = async (req, res, next) => {
    try {
      const dto = new CreateGrupoDTO(req.body);
      const data = await this.grupoService.create(dto);
      ResponseUtil.created(res, data);
    } catch (e) { next(e); }
  };

  updateGrupo = async (req, res, next) => {
    try {
      const dto = new UpdateGrupoDTO(req.body);
      const data = await this.grupoService.update(req.params.id, dto);
      ResponseUtil.success(res, data);
    } catch (e) { next(e); }
  };

  deleteGrupo = async (req, res, next) => {
    try {
      await this.grupoService.delete(req.params.id);
      ResponseUtil.noContent(res);
    } catch (e) { next(e); }
  };
}

module.exports = { AcademicController };
