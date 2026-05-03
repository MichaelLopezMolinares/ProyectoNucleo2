/**
 * Entidad: Horario
 */
class Horario {
  constructor({ id, periodo_id, estado, generado_por, estrategia, metadata, created_at, updated_at }) {
    this.id = id;
    this.periodoId = periodo_id;
    this.estado = estado;
    this.generadoPor = generado_por;
    this.estrategia = estrategia;
    this.metadata = metadata;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }
}

module.exports = { Horario };
