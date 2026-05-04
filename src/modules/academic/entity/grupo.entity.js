/**
 * Entidad: Grupo
 */
class Grupo {
  constructor({ id, codigo, capacidad, jornada, asignatura_id, docente_id, periodo, activo, created_at, updated_at }) {
    this.id = id;
    this.codigo = codigo;
    this.capacidad = capacidad;
    this.jornada = jornada;
    this.asignaturaId = asignatura_id;
    this.docenteId = docente_id;
    this.periodo = periodo;
    this.activo = activo;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }
}

module.exports = { Grupo };
