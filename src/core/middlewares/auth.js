const jwt = require('jsonwebtoken');
const jwtConfig = require('../../config/jwt');
const { UnauthorizedError, ForbiddenError } = require('../errors/AppError');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token no proporcionado'));
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch {
    next(new UnauthorizedError('Token inválido o expirado'));
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ForbiddenError('No tiene permisos para esta acción'));
  }
  next();
};

module.exports = { authenticate, authorize };
