const { AppException } = require('./app.exception');

class ValidationException extends AppException {
  constructor(errors = []) {
    super('Error de validación', 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

module.exports = { ValidationException };
