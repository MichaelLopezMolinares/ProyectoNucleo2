/**
 * Regla: Conflicto de Grupo
 * Un grupo NO puede tener dos asignaciones simultáneas
 */
const { ConstraintRule } = require('./constraint-rule.base');

class GroupConflictRule extends ConstraintRule {
  constructor() {
    super('GroupConflict', 'GRUPO');
  }

  evaluate(newAssignment, existingAssignments, _context) {
    const conflicts = [];

    for (const existing of existingAssignments) {
      if (
        newAssignment.grupo_id === existing.grupo_id &&
        this.hasTimeOverlap(newAssignment, existing)
      ) {
        conflicts.push(
          this.createConflict(
            `Grupo ${newAssignment.grupo_id} tiene conflicto de horario: ` +
            `${newAssignment.dia} ${newAssignment.hora_inicio}-${newAssignment.hora_fin}`,
            newAssignment,
            existing
          )
        );
      }
    }

    return conflicts;
  }
}

module.exports = { GroupConflictRule };
