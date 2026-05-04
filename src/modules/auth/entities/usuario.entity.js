/**
 * Entidad: Usuario
 * Módulo: Auth
 */
class Usuario {
  constructor({ id, nombre, email, password_hash, rol, activo, created_at, updated_at }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.passwordHash = password_hash;
    this.rol = rol;
    this.activo = activo;
    this.createdAt = created_at;
    this.updatedAt = updated_at;
  }

  /** Representación segura sin password */
  toSafeJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      email: this.email,
      rol: this.rol,
      activo: this.activo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = { Usuario };
