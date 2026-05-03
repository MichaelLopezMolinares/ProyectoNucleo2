/**
 * DTOs del módulo Visualización de Horarios
 */
class ScheduleFilterDTO {
  constructor({ periodoId, docenteId, programaId, aulaId, grupoId, dia, estado }) {
    this.periodoId = periodoId;
    this.docenteId = docenteId;
    this.programaId = programaId;
    this.aulaId = aulaId;
    this.grupoId = grupoId;
    this.dia = dia;
    this.estado = estado;
  }
}

module.exports = { ScheduleFilterDTO };
