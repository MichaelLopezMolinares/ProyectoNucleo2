/**
 * Middleware global de manejo de errores
 * Captura todas las excepciones y devuelve respuesta JSON consistente
 */
const { AppException } = require('../exceptions/app.exception');

const errorHandler = (err, req, res, _next) => {
  // Log del error en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('🔴 Error:', err);
  }

  // Excepciones conocidas de la aplicación
  if (err instanceof AppException) {
    const response = {
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
      },
    };

    // Agregar errores de validación si existen
    if (err.errors) {
      response.error.details = err.errors;
    }

    // Agregar conflictos si existen
    if (err.conflicts) {
      response.error.conflicts = err.conflicts;
    }

    return res.status(err.statusCode).json(response);
  }

  // Errores no controlados
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development'
        ? err.message
        : 'Error interno del servidor',
    },
  });
};

module.exports = { errorHandler };
