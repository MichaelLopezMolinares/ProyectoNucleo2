/**
 * Regla: Conflicto de Docente
 * Un docente NO puede estar asignado a dos grupos simultáneamente
 */
const { ConstraintRule } = require('./constraint-rule.base');

class TeacherConflictRule extends ConstraintRule {
  constructor() {
    super('TeacherConflict', 'DOCENTE');
  }

  evaluate(newAssignment, existingAssignments, _context) {
    const conflicts = [];

    for (const existing of existingAssignments) {
      if (
        newAssignment.docente_id === existing.docente_id &&
        this.hasTimeOverlap(newAssignment, existing)
      ) {
        conflicts.push(
          this.createConflict(
            `Docente ${newAssignment.docente_id} tiene conflicto de horario: ` +
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

module.exports = { TeacherConflictRule };
