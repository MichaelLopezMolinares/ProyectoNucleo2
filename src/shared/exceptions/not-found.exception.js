const { AppException } = require('./app.exception');

class NotFoundException extends AppException {
  constructor(resource = 'Recurso', id = '') {
    super(`${resource} ${id ? `con id ${id} ` : ''}no encontrado`, 404, 'NOT_FOUND');
  }
}

module.exports = { NotFoundException };
