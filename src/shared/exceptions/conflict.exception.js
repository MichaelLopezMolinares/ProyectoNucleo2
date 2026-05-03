const { AppException } = require('./app.exception');

class ConflictException extends AppException {
  constructor(message = 'Conflicto detectado', conflicts = []) {
    super(message, 409, 'CONFLICT');
    this.conflicts = conflicts;
  }
}

module.exports = { ConflictException };
