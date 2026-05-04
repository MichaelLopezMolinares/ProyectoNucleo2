/**
 * DTOs del módulo Docentes
 */
class CreateDocenteDTO {
  constructor({ codigo, nombre, apellido, email, tipoContrato, maxHorasSemana }) {
    this.codigo = codigo;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.tipoContrato = tipoContrato;
    this.maxHorasSemana = maxHorasSemana || 20;
  }
}

class UpdateDocenteDTO {
  constructor({ nombre, apellido, email, tipoContrato, maxHorasSemana, activo }) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.tipoContrato = tipoContrato;
    this.maxHorasSemana = maxHorasSemana;
    this.activo = activo;
  }
}

class DisponibilidadDTO {
  constructor({ dia, horaInicio, horaFin }) {
    this.dia = dia;
    this.horaInicio = horaInicio;
    this.horaFin = horaFin;
  }
}

module.exports = { CreateDocenteDTO, UpdateDocenteDTO, DisponibilidadDTO };
