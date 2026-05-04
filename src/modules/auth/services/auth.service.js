/**
 * Servicio: Autenticación
 * Módulo: Auth
 * Lógica de negocio — login, registro, JWT
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authConfig } = require('../../../config/auth.config');
const { AuthRepository } = require('../repositories/auth.repository');
const { UnauthorizedException, ConflictException, NotFoundException } = require('../../../shared/exceptions');

class AuthService {
  constructor() {
    this.authRepository = new AuthRepository();
  }

  async login(loginDTO) {
    const user = await this.authRepository.findByEmail(loginDTO.email);
    if (!user || !user.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const validPassword = await bcrypt.compare(loginDTO.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this._generateToken(user);
    return { token, user: user.toSafeJSON() };
  }

  async register(registerDTO) {
    const existing = await this.authRepository.findByEmail(registerDTO.email);
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(registerDTO.password, 10);
    const user = await this.authRepository.create({
      nombre: registerDTO.nombre,
      email: registerDTO.email,
      passwordHash,
      rol: registerDTO.rol,
    });

    return user.toSafeJSON();
  }

  async findAll() {
    const users = await this.authRepository.findAll();
    return users.map(u => u.toSafeJSON());
  }

  async findById(id) {
    const user = await this.authRepository.findById(id);
    if (!user) throw new NotFoundException('Usuario', id);
    return user.toSafeJSON();
  }

  async update(id, updateDTO) {
    const user = await this.authRepository.update(id, updateDTO);
    if (!user) throw new NotFoundException('Usuario', id);
    return user.toSafeJSON();
  }

  async delete(id) {
    const deleted = await this.authRepository.delete(id);
    if (!deleted) throw new NotFoundException('Usuario', id);
    return true;
  }

  _generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiresIn }
    );
  }
}

module.exports = { AuthService };
