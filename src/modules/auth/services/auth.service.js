const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepo = require('../repository/auth.repository');
const jwtConfig = require('../../../config/jwt');
const { UnauthorizedError, ConflictError } = require('../../../core/errors/AppError');

class AuthService {
  async login({ email, password }) {
    const user = await authRepo.findByEmail(email);
    if (!user) throw new UnauthorizedError('Credenciales inválidas');
    if (!user.active) throw new UnauthorizedError('Usuario inactivo');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new UnauthorizedError('Credenciales inválidas');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return {
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    };
  }

  async register({ username, email, password, role }) {
    const existing = await authRepo.findByEmail(email);
    if (existing) throw new ConflictError('El correo ya está registrado');

    const passwordHash = await bcrypt.hash(password, 12);
    return authRepo.create({ username, email, passwordHash, role: role || 'viewer' });
  }

  async getProfile(userId) {
    const user = await authRepo.findById(userId);
    if (!user) throw new UnauthorizedError();
    const { password_hash, ...profile } = user;
    return profile;
  }
}

module.exports = new AuthService();
