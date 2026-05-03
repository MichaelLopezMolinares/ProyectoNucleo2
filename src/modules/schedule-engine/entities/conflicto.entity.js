/**
 * Entidad: Conflicto registrado
 */
class Conflicto {
  constructor({ id, horario_id, tipo, severidad, descripcion, asignacion_a_id, asignacion_b_id, resuelto, created_at }) {
    this.id = id;
    this.horarioId = horario_id;
    this.tipo = tipo;
    this.severidad = severidad;
    this.descripcion = descripcion;
    this.asignacionAId = asignacion_a_id;
    this.asignacionBId = asignacion_b_id;
    this.resuelto = resuelto;
    this.createdAt = created_at;
  }
}

module.exports = { Conflicto };
