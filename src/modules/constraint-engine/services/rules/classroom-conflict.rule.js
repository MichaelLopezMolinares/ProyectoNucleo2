/**
 * Regla: Conflicto de Aula
 * Un aula NO puede tener dos asignaciones simultáneas
 */
const { ConstraintRule } = require('./constraint-rule.base');

class ClassroomConflictRule extends ConstraintRule {
  constructor() {
    super('ClassroomConflict', 'AULA');
  }

  evaluate(newAssignment, existingAssignments, _context) {
    const conflicts = [];

    for (const existing of existingAssignments) {
      if (
        newAssignment.aula_id === existing.aula_id &&
        this.hasTimeOverlap(newAssignment, existing)
      ) {
        conflicts.push(
          this.createConflict(
            `Aula ${newAssignment.aula_id} tiene conflicto de horario: ` +
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

module.exports = { ClassroomConflictRule };
