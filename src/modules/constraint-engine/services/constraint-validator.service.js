/**
 * ═══════════════════════════════════════════════════════════════
 * MOTOR DE VALIDACIÓN DE RESTRICCIONES
 * ═══════════════════════════════════════════════════════════════
 *
 * Componente central del sistema que evalúa reglas de negocio
 * sobre las asignaciones de horarios.
 *
 * Patrón: Chain of Responsibility + Strategy
 * Cada regla implementa la interfaz ConstraintRule.
 *
 * Tipos de conflicto:
 * - DOCENTE:    Mismo docente en dos asignaciones simultáneas
 * - AULA:       Misma aula en dos asignaciones simultáneas
 * - GRUPO:      Mismo grupo en dos asignaciones simultáneas
 * - TIEMPO:     Violación de disponibilidad horaria del docente
 * - CAPACIDAD:  Grupo excede capacidad del aula asignada
 * ═══════════════════════════════════════════════════════════════
 */
const { TeacherConflictRule } = require('./rules/teacher-conflict.rule');
const { ClassroomConflictRule } = require('./rules/classroom-conflict.rule');
const { GroupConflictRule } = require('./rules/group-conflict.rule');
const { TimeConflictRule } = require('./rules/time-conflict.rule');
const { CapacityConflictRule } = require('./rules/capacity-conflict.rule');

class ConstraintValidatorService {
  constructor() {
    // Registro de todas las reglas de validación
    this.rules = [
      new TeacherConflictRule(),
      new ClassroomConflictRule(),
      new GroupConflictRule(),
      new TimeConflictRule(),
      new CapacityConflictRule(),
    ];
  }

  /**
   * Valida una asignación nueva contra las asignaciones existentes
   * @param {object} newAssignment - La nueva asignación a validar
   * @param {Array} existingAssignments - Asignaciones ya confirmadas
   * @param {object} context - Contexto adicional (docente, aula, grupo)
   * @returns {{ valid: boolean, conflicts: Array }}
   */
  validateAssignment(newAssignment, existingAssignments, context = {}) {
    const conflicts = [];

    for (const rule of this.rules) {
      const ruleConflicts = rule.evaluate(newAssignment, existingAssignments, context);
      conflicts.push(...ruleConflicts);
    }

    return {
      valid: conflicts.filter(c => c.severidad === 'ERROR').length === 0,
      conflicts,
    };
  }

  /**
   * Valida un horario completo (todas las asignaciones entre sí)
   * @param {Array} assignments - Todas las asignaciones del horario
   * @param {object} context - Contexto adicional
   * @returns {{ valid: boolean, conflicts: Array, stats: object }}
   */
  validateSchedule(assignments, context = {}) {
    const allConflicts = [];

    for (let i = 0; i < assignments.length; i++) {
      const others = assignments.filter((_, idx) => idx !== i);
      const { conflicts } = this.validateAssignment(assignments[i], others, context);
      allConflicts.push(...conflicts);
    }

    // Eliminar conflictos duplicados (A vs B = B vs A)
    const uniqueConflicts = this._deduplicateConflicts(allConflicts);

    return {
      valid: uniqueConflicts.filter(c => c.severidad === 'ERROR').length === 0,
      conflicts: uniqueConflicts,
      stats: {
        total: uniqueConflicts.length,
        errors: uniqueConflicts.filter(c => c.severidad === 'ERROR').length,
        warnings: uniqueConflicts.filter(c => c.severidad === 'WARNING').length,
      },
    };
  }

  /**
   * Verifica rápidamente si una asignación es factible
   * (sin generar detalle completo de conflictos)
   * @param {object} newAssignment
   * @param {Array} existingAssignments
   * @param {object} context
   * @returns {boolean}
   */
  isFeasible(newAssignment, existingAssignments, context = {}) {
    for (const rule of this.rules) {
      const conflicts = rule.evaluate(newAssignment, existingAssignments, context);
      if (conflicts.some(c => c.severidad === 'ERROR')) {
        return false;
      }
    }
    return true;
  }

  /** Elimina conflictos duplicados basándose en las asignaciones involucradas */
  _deduplicateConflicts(conflicts) {
    const seen = new Set();
    return conflicts.filter(c => {
      const key = [c.tipo, ...[c.asignacionA, c.asignacionB].sort()].join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}

module.exports = { ConstraintValidatorService };
