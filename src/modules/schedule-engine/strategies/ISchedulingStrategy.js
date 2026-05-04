/**
 * Interfaz base para estrategias de generación de horarios.
 * Todas las estrategias deben implementar el método generate().
 */
class ISchedulingStrategy {
  /**
   * @param {Object} context - { groups, teachers, classrooms, constraints }
   * @returns {Promise<Array>} assignments generadas
   */
  async generate(context) {
    throw new Error('generate() debe ser implementado por la estrategia concreta');
  }
}

module.exports = ISchedulingStrategy;
