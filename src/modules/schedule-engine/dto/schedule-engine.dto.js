/**
 * DTOs del Motor de Horarios
 */
class GenerateScheduleDTO {
  constructor({ periodoId, estrategia, userId }) {
    this.periodoId = periodoId;
    this.estrategia = estrategia || 'greedy'; // 'greedy' | 'backtracking'
    this.userId = userId;
  }
}

class CreateAssignmentDTO {
  constructor({ horarioId, grupoId, aulaId, docenteId, dia, horaInicio, horaFin }) {
    this.horarioId = horarioId;
    this.grupoId = grupoId;
    this.aulaId = aulaId;
    this.docenteId = docenteId;
    this.dia = dia;
    this.horaInicio = horaInicio;
    this.horaFin = horaFin;
  }
}

module.exports = { GenerateScheduleDTO, CreateAssignmentDTO };
