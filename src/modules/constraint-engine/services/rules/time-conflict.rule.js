/**
 * Regla: Conflicto de Tiempo (Disponibilidad del docente)
 * Un docente NO puede ser asignado fuera de su disponibilidad horaria
 */
const { ConstraintRule } = require('./constraint-rule.base');

class TimeConflictRule extends ConstraintRule {
  constructor() {
    super('TimeConflict', 'TIEMPO');
  }

  /**
   * @param {object} newAssignment
   * @param {Array} existingAssignments - No se usa en esta regla
   * @param {object} context - Debe contener { disponibilidadDocentes: Map<docenteId, Array> }
   */
  evaluate(newAssignment, _existingAssignments, context) {
    const conflicts = [];

    if (!context.disponibilidadDocentes) return conflicts;

    const disponibilidad = context.disponibilidadDocentes.get(newAssignment.docente_id);
    if (!disponibilidad || disponibilidad.length === 0) {
      // Sin disponibilidad registrada: WARNING, no ERROR
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
      d.horaFin >= newAssignment.hora_fin
    );

    if (!isAvailable) {
      conflicts.push(
        this.createConflict(
          `Docente ${newAssignment.docente_id} no tiene disponibilidad ` +
          `el ${newAssignment.dia} de ${newAssignment.hora_inicio} a ${newAssignment.hora_fin}`,
          newAssignment,
          null
        )
      );
    }

    return conflicts;
  }
}

module.exports = { TimeConflictRule };
