/**
 * Excepción base de la aplicación
 * Todas las excepciones personalizadas extienden de esta clase
 */
class AppException extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppException };
