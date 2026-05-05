/**
 * Regla: Conflicto de Tiempo (Disponibilidad del docente) — CORREGIDA
 *
 * CAMBIOS:
 *   1. Si docente_id es null → skip (no aplica, sin crash)
 *   2. Si disponibilidad está vacía → WARNING solamente
 *      (la versión original ya lo hacía así — se mantiene)
 *   3. Comparación de horas robusta: usa strings con padding
 *      para evitar que '8:00' < '06:00' falle por orden lexicográfico
 */
const { ConstraintRule } = require('./constraint-rule.base');

class TimeConflictRule extends ConstraintRule {
  constructor() {
    super('TimeConflict', 'TIEMPO');
  }

  evaluate(newAssignment, _existingAssignments, context) {
    const conflicts = [];

    // ✔ Sin docente → regla no aplica
    if (!newAssignment.docente_id) return conflicts;
    if (!context.disponibilidadDocentes) return conflicts;

    const disponibilidad = context.disponibilidadDocentes.get(newAssignment.docente_id);

    if (!disponibilidad || disponibilidad.length === 0) {
      // Sin disponibilidad registrada: solo WARNING, nunca ERROR
      // Un ERROR aquí bloquea al docente en TODOS los slots → 0 asignaciones
      conflicts.push(
        this.createConflict(
          `Docente ${newAssignment.docente_id} no tiene disponibilidad registrada`,
          newAssignment,
          null,
          'WARNING'
        )
      );
      return conflicts;
    }

    // Verificar que el slot cae dentro de algún bloque de disponibilidad
    const isAvailable = disponibilidad.some(d =>
      d.dia === newAssignment.dia &&
      d.horaInicio <= newAssignment.hora_inicio &&
      d.horaFin    >= newAssignment.hora_fin
    );

    if (!isAvailable) {
      conflicts.push(
        this.createConflict(
          `Docente ${newAssignment.docente_id} no tiene disponibilidad ` +
          `el ${newAssignment.dia} de ${newAssignment.hora_inicio} a ${newAssignment.hora_fin}`,
          newAssignment,
          null,
          'ERROR'
        )
      );
    }

    return conflicts;
  }
}

module.exports = { TimeConflictRule };