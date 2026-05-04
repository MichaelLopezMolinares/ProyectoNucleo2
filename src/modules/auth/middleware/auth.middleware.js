/**
 * Middleware de autenticación JWT
 * Verifica token y adjunta usuario a req.user
 */
const jwt = require('jsonwebtoken');
const { authConfig } = require('../../../config/auth.config');
const { UnauthorizedException } = require('../../../shared/exceptions');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedException('Token no proporcionado'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, authConfig.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    next(new UnauthorizedException('Token inválido o expirado'));
  }
};

/**
 * Middleware de autorización por roles
 * @param  {...string} allowedRoles - Roles permitidos
 */
const roleMiddleware = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.rol)) {
    return next(new UnauthorizedException('No tiene permisos para esta acción'));
  }
  next();
};

module.exports = { authMiddleware, roleMiddleware };
