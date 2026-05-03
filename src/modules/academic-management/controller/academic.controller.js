const { validationResult } = require('express-validator');
const academicService = require('../service/academic.service');
const { ValidationError } = require('../../../core/errors/AppError');

class AcademicController {
  // ── Programas ──────────────────────────────────────
  async getPrograms(req, res, next) {
    try {
      const programs = await academicService.getAllPrograms();
      res.json({ success: true, data: programs });
    } catch (err) { next(err); }
  }

  async getProgram(req, res, next) {
    try {
      const program = await academicService.getProgramById(req.params.id);
      res.json({ success: true, data: program });
    } catch (err) { next(err); }
  }

  async createProgram(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new ValidationError('Datos inválidos', errors.array());
      const program = await academicService.createProgram(req.body);
      res.status(201).json({ success: true, data: program });
    } catch (err) { next(err); }
  }

  async updateProgram(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new ValidationError('Datos inválidos', errors.array());
      const program = await academicService.updateProgram(req.params.id, req.body);
      res.json({ success: true, data: program });
    } catch (err) { next(err); }
  }

  async deleteProgram(req, res, next) {
    try {
      await academicService.deleteProgram(req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  }

  // ── Asignaturas ────────────────────────────────────
  async getSubjectsByProgram(req, res, next) {
    try {
      const subjects = await academicService.getSubjectsByProgram(req.params.programId);
      res.json({ success: true, data: subjects });
    } catch (err) { next(err); }
  }

  async createSubject(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new ValidationError('Datos inválidos', errors.array());
      const subject = await academicService.createSubject(req.body);
      res.status(201).json({ success: true, data: subject });
    } catch (err) { next(err); }
  }

  // ── Grupos ─────────────────────────────────────────
  async createGroup(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new ValidationError('Datos inválidos', errors.array());
      const group = await academicService.createGroup(req.body);
      res.status(201).json({ success: true, data: group });
    } catch (err) { next(err); }
  }
}

module.exports = new AcademicController();
