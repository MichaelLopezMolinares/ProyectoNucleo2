/**
 * DTOs del módulo Auth
 */

class LoginDTO {
  constructor({ email, password }) {
    this.email = email;
    this.password = password;
  }
}

class RegisterDTO {
  constructor({ nombre, email, password, rol }) {
    this.nombre = nombre;
    this.email = email;
    this.password = password;
    this.rol = rol;
  }
}

class UpdateUserDTO {
  constructor({ nombre, email, rol, activo }) {
    this.nombre = nombre;
    this.email = email;
    this.rol = rol;
    this.activo = activo;
  }
}

module.exports = { LoginDTO, RegisterDTO, UpdateUserDTO };
