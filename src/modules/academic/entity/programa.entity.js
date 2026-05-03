/**
 * Entidad: Programa Académico
 */
class Programa {
  constructor({ id, codigo, nombre, facultad, activo, created_at, updated_at }) {
    this.id = id;
    this.codigo = codigo;
    this.nombre = nombre;
    this.facultad = facultad;
    this.activo = activo;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }
}

module.exports = { Programa };
