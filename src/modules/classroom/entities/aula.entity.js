/**
 * Entidad: Aula
 */
class Aula {
  constructor({ id, codigo, nombre, edificio, capacidad, tipo, activo, created_at, updated_at }) {
    this.id = id;
    this.codigo = codigo;
    this.nombre = nombre;
    this.edificio = edificio;
    this.capacidad = capacidad;
    this.tipo = tipo;
    this.activo = activo;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }
}

module.exports = { Aula };
