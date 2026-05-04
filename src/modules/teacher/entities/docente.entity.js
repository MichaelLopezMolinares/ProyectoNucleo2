/**
 * Entidad: Docente
 */
class Docente {
  constructor({ id, codigo, nombre, apellido, email, tipo_contrato, max_horas_semana, activo, created_at, updated_at }) {
    this.id = id;
    this.codigo = codigo;
    this.nombre = nombre;
    this.apellido = apellido;
    this.email = email;
    this.tipoContrato = tipo_contrato;
    this.maxHorasSemana = max_horas_semana;
    this.activo = activo;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  get nombreCompleto() {
    return `${this.nombre} ${this.apellido}`;
  }
}

module.exports = { Docente };
