/**
 * Interfaz base para reglas de restricción
 * Todas las reglas deben implementar el método evaluate()
 *
 * Patrón: Strategy
 */
class ConstraintRule {
  /**
   * @param {string} name - Nombre de la regla
   * @param {string} tipo - Tipo de conflicto (DOCENTE, AULA, GRUPO, TIEMPO, CAPACIDAD)
   */
  constructor(name, tipo) {
    this.name = name;
    this.tipo = tipo;
  }

  /**
   * Evalúa la regla contra una nueva asignación
   * @param {object} newAssignment - Nueva asignación a evaluar
   * @param {Array} existingAssignments - Asignaciones existentes
   * @param {object} context - Contexto adicional (docentes, aulas, etc.)
   * @returns {Array<{ tipo, severidad, descripcion, asignacionA, asignacionB }>}
   */
  evaluate(newAssignment, existingAssignments, context) {
    throw new Error(`La regla ${this.name} debe implementar evaluate()`);
  }

  /**
   * Verifica si dos asignaciones se solapan en tiempo
   * @param {object} a - Asignación A { dia, hora_inicio, hora_fin }
   * @param {object} b - Asignación B { dia, hora_inicio, hora_fin }
   * @returns {boolean}
   */
  hasTimeOverlap(a, b) {
    if (a.dia !== b.dia) return false;
    return a.hora_inicio < b.hora_fin && a.hora_fin > b.hora_inicio;
  }

  /** Helper para crear un objeto conflicto */
  createConflict(descripcion, asignacionA, asignacionB, severidad = 'ERROR') {
    return {
      tipo: this.tipo,
      severidad,
      descripcion,
      asignacionA: asignacionA?.id || asignacionA,
      asignacionB: asignacionB?.id || asignacionB,
    };
  }
}

module.exports = { ConstraintRule };
