const { AppError } = require('../errors/AppError');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
      ...(err.conflicts && { conflicts: err.conflicts }),
    });
  }

  // Error inesperado
  return res.status(500).json({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'Error interno del servidor',
  });
};

module.exports = { errorHandler };
