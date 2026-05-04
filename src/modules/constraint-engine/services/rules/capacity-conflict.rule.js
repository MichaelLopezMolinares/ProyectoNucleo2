/**
 * Regla: Conflicto de Capacidad
 * La capacidad del grupo NO debe exceder la del aula asignada
 */
const { ConstraintRule } = require('./constraint-rule.base');

class CapacityConflictRule extends ConstraintRule {
  constructor() {
    super('CapacityConflict', 'CAPACIDAD');
  }

  /**
   * @param {object} newAssignment
   * @param {Array} existingAssignments - No se usa en esta regla
   * @param {object} context - Debe contener { aulas: Map<aulaId, Aula>, grupos: Map<grupoId, Grupo> }
   */
  evaluate(newAssignment, _existingAssignments, context) {
    const conflicts = [];

    if (!context.aulas || !context.grupos) return conflicts;

    const aula = context.aulas.get(newAssignment.aula_id);
    const grupo = context.grupos.get(newAssignment.grupo_id);

    if (aula && grupo && grupo.capacidad > aula.capacidad) {
      conflicts.push(
        this.createConflict(
          `Grupo (${grupo.capacidad} estudiantes) excede capacidad del aula ` +
          `${aula.codigo} (${aula.capacidad} lugares)`,
          newAssignment,
          null,
          'WARNING'
        )
      );
    }

    return conflicts;
  }
}

module.exports = { CapacityConflictRule };
