/**
 * Controlador: Autenticación
 * Módulo: Auth
 * Capa de presentación — recibe HTTP, delega al servicio
 */
const { validationResult } = require('express-validator');
const { AuthService } = require('../services/auth.service');
const { LoginDTO, RegisterDTO, UpdateUserDTO } = require('../dto/auth.dto');
const { ResponseUtil } = require('../../../shared/utils/response.util');
const { ValidationException } = require('../../../shared/exceptions');

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  login = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new ValidationException(errors.array());

      const dto = new LoginDTO(req.body);
      const result = await this.authService.login(dto);
      ResponseUtil.success(res, result);
    } catch (error) {
      next(error);
    }
  };

  register = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) throw new ValidationException(errors.array());

      const dto = new RegisterDTO(req.body);
      const result = await this.authService.register(dto);
      ResponseUtil.created(res, result);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req, res, next) => {
    try {
      const users = await this.authService.findAll();
      ResponseUtil.success(res, users);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req, res, next) => {
    try {
      const user = await this.authService.findById(req.params.id);
      ResponseUtil.success(res, user);
    } catch (error) {
      next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const dto = new UpdateUserDTO(req.body);
      const user = await this.authService.update(req.params.id, dto);
      ResponseUtil.success(res, user);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req, res, next) => {
    try {
      await this.authService.delete(req.params.id);
      ResponseUtil.noContent(res);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { AuthController };
