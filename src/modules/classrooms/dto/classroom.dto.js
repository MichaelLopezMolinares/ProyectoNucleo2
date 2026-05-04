/**
 * DTOs del módulo Aulas
 */
class CreateAulaDTO {
  constructor({ codigo, nombre, edificio, capacidad, tipo }) {
    this.codigo = codigo;
    this.nombre = nombre;
    this.edificio = edificio;
    this.capacidad = capacidad;
    this.tipo = tipo;
  }
}

class UpdateAulaDTO {
  constructor({ nombre, edificio, capacidad, tipo, activo }) {
    this.nombre = nombre;
    this.edificio = edificio;
    this.capacidad = capacidad;
    this.tipo = tipo;
    this.activo = activo;
  }
}

module.exports = { CreateAulaDTO, UpdateAulaDTO };
