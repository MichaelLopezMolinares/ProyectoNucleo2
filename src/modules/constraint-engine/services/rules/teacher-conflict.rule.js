/**
 * Regla: Conflicto de Docente — VERSIÓN CORREGIDA
 *
 * BUG ORIGINAL:
 *   La condición `newAssignment.docente_id === existing.docente_id`
 *   evalúa `null === null` como TRUE cuando ambos grupos no tienen
 *   docente asignado. Esto hace que todos los grupos sin docente
 *   se bloqueen entre sí como si fueran el mismo docente,
 *   limitando cada franja horaria a 1 solo grupo sin docente.
 *
 * FIX:
 *   Agregar `&& newAssignment.docente_id && existing.docente_id`
 *   antes de comparar. Si alguno es null → la regla no aplica.
 */
const { ConstraintRule } = require('./constraint-rule.base');

class TeacherConflictRule extends ConstraintRule {
  constructor() {
    super('TeacherConflict', 'DOCENTE');
  }

  evaluate(newAssignment, existingAssignments, _context) {
    const conflicts = [];

    // ✔ FIX: si no hay docente asignado, esta regla no aplica
    if (!newAssignment.docente_id) return conflicts;

    for (const existing of existingAssignments) {
      // ✔ FIX: verificar que existing también tenga docente antes de comparar
      if (!existing.docente_id) continue;

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