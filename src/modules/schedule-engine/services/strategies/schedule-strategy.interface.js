/**
 * ═══════════════════════════════════════════════════════════════
 * INTERFAZ DE ESTRATEGIA DE GENERACIÓN
 * ═══════════════════════════════════════════════════════════════
 *
 * Patrón Strategy: Define la interfaz que deben implementar
 * todas las estrategias de generación de horarios.
 *
 * Cada estrategia recibe los grupos a programar, las aulas
 * disponibles, la disponibilidad de docentes y el validador
 * de restricciones. Retorna un arreglo de asignaciones.
 * ═══════════════════════════════════════════════════════════════
 */
class ScheduleStrategy {
  /**
   * @param {string} name - Nombre identificador de la estrategia
   */
  constructor(name) {
    this.name = name;
  }

  /**
   * Genera las asignaciones de horario
   * @param {object} params
   * @param {Array} params.grupos - Grupos a programar
   * @param {Array} params.aulas - Aulas disponibles
   * @param {Map} params.disponibilidadDocentes - Disponibilidad por docente
   * @param {Map} params.aulasMap - Mapa de aulas por ID
   * @param {Map} params.gruposMap - Mapa de grupos por ID
   * @param {import('../../constraint-engine').ConstraintValidatorService} params.constraintValidator
   * @param {Array} params.timeSlots - Franjas horarias
   * @param {Array} params.days - Días de la semana
   * @returns {Promise<{ assignments: Array, unassigned: Array, stats: object }>}
   */
  async generate(params) {
    throw new Error(`La estrategia ${this.name} debe implementar generate()`);
  }
}

module.exports = { ScheduleStrategy };
