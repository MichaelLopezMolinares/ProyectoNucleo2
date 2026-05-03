/**
 * Entidad: Asignación (slot de horario)
 */
class Asignacion {
  constructor({ id, horario_id, grupo_id, aula_id, docente_id, dia, hora_inicio, hora_fin }) {
    this.id = id;
    this.horarioId = horario_id;
    this.grupoId = grupo_id;
    this.aulaId = aula_id;
    this.docenteId = docente_id;
    this.dia = dia;
    this.hora_inicio = hora_inicio; // snake_case para compatibilidad con reglas
    this.hora_fin = hora_fin;
    this.docente_id = docente_id;
    this.aula_id = aula_id;
    this.grupo_id = grupo_id;
  }
}

module.exports = { Asignacion };
