/**
 * DTOs del módulo Académico
 */
class CreateProgramaDTO {
  constructor({ codigo, nombre, facultad }) {
    this.codigo = codigo;
    this.nombre = nombre;
    this.facultad = facultad;
  }
}

class UpdateProgramaDTO {
  constructor({ nombre, facultad, activo }) {
    this.nombre = nombre;
    this.facultad = facultad;
    this.activo = activo;
  }
}

class CreateAsignaturaDTO {
  constructor({ codigo, nombre, creditos, horasSemanales, semestre, programaId }) {
    this.codigo = codigo;
    this.nombre = nombre;
    this.creditos = creditos;
    this.horasSemanales = horasSemanales;
    this.semestre = semestre;
    this.programaId = programaId;
  }
}

class UpdateAsignaturaDTO {
  constructor({ nombre, creditos, horasSemanales, semestre, activo }) {
    this.nombre = nombre;
    this.creditos = creditos;
    this.horasSemanales = horasSemanales;
    this.semestre = semestre;
    this.activo = activo;
  }
}

class CreateGrupoDTO {
  constructor({ codigo, capacidad, jornada, asignaturaId, docenteId, periodo }) {
    this.codigo = codigo;
    this.capacidad = capacidad;
    this.jornada = jornada;
    this.asignaturaId = asignaturaId;
    this.docenteId = docenteId;
    this.periodo = periodo;
  }
}

class UpdateGrupoDTO {
  constructor({ capacidad, jornada, docenteId, activo }) {
    this.capacidad = capacidad;
    this.jornada = jornada;
    this.docenteId = docenteId;
    this.activo = activo;
  }
}

module.exports = {
  CreateProgramaDTO, UpdateProgramaDTO,
  CreateAsignaturaDTO, UpdateAsignaturaDTO,
  CreateGrupoDTO, UpdateGrupoDTO,
};
