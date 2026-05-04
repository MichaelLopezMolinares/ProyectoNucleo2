const { AppException } = require('./app.exception');

class UnauthorizedException extends AppException {
  constructor(message = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

module.exports = { UnauthorizedException };
