/**
 * Entidad: Asignatura
 */
class Asignatura {
  constructor({ id, codigo, nombre, creditos, horas_semanales, semestre, programa_id, activo, created_at, updated_at }) {
    this.id = id;
    this.codigo = codigo;
    this.nombre = nombre;
    this.creditos = creditos;
    this.horasSemanales = horas_semanales;
    this.semestre = semestre;
    this.programaId = programa_id;
    this.activo = activo;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }
}

module.exports = { Asignatura };
