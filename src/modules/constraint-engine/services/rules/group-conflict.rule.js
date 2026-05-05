/**
 * Regla: Conflicto de Grupo — v2 (multi-asignatura)
 *
 * CAMBIO RESPECTO A v1:
 *   En el nuevo modelo, `grupo_id` en las asignaciones referencia
 *   al GRUPO REAL (G1, G2...), no al UUID de grupo_asignaturas.
 *   Esto permite que esta regla detecte correctamente que:
 *
 *     G1-BaseDatos   (grupo_id = UUID_G1, Lunes 06:00-08:00)
 *     G1-Programación (grupo_id = UUID_G1, Lunes 06:00-08:00)
 *
 *   son un conflicto de horario para el grupo G1, aunque sean
 *   asignaturas distintas.
 *
 *   No se requiere ningún cambio en la lógica de evaluate() porque
 *   ya compara `grupo_id` y `hasTimeOverlap`. El fix real está en
 *   ScheduleGeneratorService donde se asegura que `grupo_id` en el
 *   candidato es siempre el grupoId real, no el ga.id.
 *
 *   Este archivo se deja explícitamente documentado para dejar
 *   clara la intención del diseño.
 */
const { ConstraintRule } = require('./constraint-rule.base');

class GroupConflictRule extends ConstraintRule {
  constructor() {
    super('GroupConflict', 'GRUPO');
  }

  /**
   * Detecta si el grupo real ya tiene una asignación en el mismo
   * slot de tiempo — independientemente de qué asignatura sea.
   */
  evaluate(newAssignment, existingAssignments, _context) {
    const conflicts = [];

    for (const existing of existingAssignments) {
      if (
        newAssignment.grupo_id === existing.grupo_id &&
        this.hasTimeOverlap(newAssignment, existing)
      ) {
        conflicts.push(
          this.createConflict(
            `Grupo ${newAssignment.grupo_id} ya tiene clase el ` +
            `${newAssignment.dia} de ${newAssignment.hora_inicio} a ${newAssignment.hora_fin}`,
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