/**
 * Entidad: Disponibilidad del Docente
 */
class DocenteDisponibilidad {
  constructor({ id, docente_id, dia, hora_inicio, hora_fin }) {
    this.id = id;
    this.docenteId = docente_id;
    this.dia = dia;
    this.horaInicio = hora_inicio;
    this.horaFin = hora_fin;
  }
}

module.exports = { DocenteDisponibilidad };
