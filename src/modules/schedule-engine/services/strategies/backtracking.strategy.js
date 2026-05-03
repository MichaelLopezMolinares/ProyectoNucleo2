/**
 * ═══════════════════════════════════════════════════════════════
 * ESTRATEGIA BACKTRACKING
 * ═══════════════════════════════════════════════════════════════
 *
 * Asignación con retroceso:
 * 1. Intenta asignar cada grupo de forma incremental
 * 2. Si una asignación genera conflicto, retrocede e
 *    intenta la siguiente opción
 * 3. Explora hasta encontrar una solución completa o
 *    agotar las opciones (con límite de profundidad)
 *
 * Ventajas: Encuentra soluciones más completas
 * Desventajas: Más lento, puede ser exponencial
 * ═══════════════════════════════════════════════════════════════
 */
const { ScheduleStrategy } = require('./schedule-strategy.interface');

class BacktrackingStrategy extends ScheduleStrategy {
  constructor() {
    super('backtracking');
    this.MAX_BACKTRACKS = 10000; // Límite para evitar loops infinitos
  }

  async generate({ grupos, aulas, disponibilidadDocentes, aulasMap, gruposMap, constraintValidator, timeSlots, days }) {
    const assignments = [];
    const unassigned = [];
    let backtracks = 0;
    let attempts = 0;

    const sortedGrupos = [...grupos].sort((a, b) =>
      (b.horasSemanales || 2) - (a.horasSemanales || 2)
    );

    // Generar todas las opciones posibles para cada grupo
    const options = sortedGrupos.map(grupo => {
      const slots = [];
      for (const dia of days) {
        for (const slot of timeSlots) {
          for (const aula of aulas) {
            slots.push({
              grupo_id: grupo.id,
              docente_id: grupo.docenteId,
              aula_id: aula.id,
              dia,
              hora_inicio: slot.start,
              hora_fin: slot.end,
            });
          }
        }
      }
      return { grupo, slots };
    });

    const context = {
      disponibilidadDocentes,
      aulas: aulasMap,
      grupos: gruposMap,
    };

    // Función recursiva de backtracking
    const solve = (index) => {
      if (index >= options.length) return true; // Todos asignados
      if (backtracks >= this.MAX_BACKTRACKS) return false; // Límite alcanzado

      const { grupo, slots } = options[index];

      for (const candidate of slots) {
        attempts++;

        const isFeasible = constraintValidator.isFeasible(
          candidate,
          assignments,
          context
        );

        if (isFeasible) {
          assignments.push(candidate);

          if (solve(index + 1)) {
            return true;
          }

          // Backtrack: quitar la asignación y probar siguiente
          assignments.pop();
          backtracks++;
        }
      }

      return false; // No se encontró solución para este grupo
    };

    const solved = solve(0);

    // Identificar grupos no asignados
    if (!solved) {
      const assignedGrupoIds = new Set(assignments.map(a => a.grupo_id));
      for (const { grupo } of options) {
        if (!assignedGrupoIds.has(grupo.id)) {
          unassigned.push({
            grupoId: grupo.id,
            grupoCodigo: grupo.codigo,
            razon: backtracks >= this.MAX_BACKTRACKS
              ? 'Límite de intentos alcanzado'
              : 'No se encontró slot factible',
          });
        }
      }
    }

    return {
      assignments,
      unassigned,
      stats: {
        strategy: this.name,
        totalGrupos: grupos.length,
        assigned: assignments.length,
        unassigned: unassigned.length,
        attempts,
        backtracks,
        solutionComplete: solved,
      },
    };
  }
}

module.exports = { BacktrackingStrategy };
