/**
 * ═══════════════════════════════════════════════════════════════
 * ESTRATEGIA GREEDY (Voraz)
 * ═══════════════════════════════════════════════════════════════
 *
 * Asignación incremental:
 * 1. Ordena grupos por prioridad (horas semanales desc)
 * 2. Para cada grupo, intenta asignar en el primer slot
 *    factible (día + hora + aula) que pase la validación
 * 3. Si no encuentra slot, marca como no asignado
 *
 * Ventajas: Rápido, determinístico
 * Desventajas: No garantiza solución óptima
 * ═══════════════════════════════════════════════════════════════
 */
const { ScheduleStrategy } = require('./schedule-strategy.interface');

class GreedyStrategy extends ScheduleStrategy {
  constructor() {
    super('greedy');
  }

  async generate({ grupos, aulas, disponibilidadDocentes, aulasMap, gruposMap, constraintValidator, timeSlots, days }) {
    const assignments = [];
    const unassigned = [];
    let attempts = 0;

    // Ordenar grupos por horas semanales (mayor prioridad primero)
    const sortedGrupos = [...grupos].sort((a, b) =>
      (b.horasSemanales || 2) - (a.horasSemanales || 2)
    );

    for (const grupo of sortedGrupos) {
      let assigned = false;

      // Intentar cada combinación de día + franja + aula
      for (const dia of days) {
        if (assigned) break;

        for (const slot of timeSlots) {
          if (assigned) break;

          for (const aula of aulas) {
            attempts++;

            const candidateAssignment = {
              grupo_id: grupo.id,
              docente_id: grupo.docenteId,
              aula_id: aula.id,
              dia,
              hora_inicio: slot.start,
              hora_fin: slot.end,
            };

            // Contexto para validación
            const context = {
              disponibilidadDocentes,
              aulas: aulasMap,
              grupos: gruposMap,
            };

            // Validar con el motor de restricciones
            const isFeasible = constraintValidator.isFeasible(
              candidateAssignment,
              assignments,
              context
            );

            if (isFeasible) {
              assignments.push(candidateAssignment);
              assigned = true;
            }
          }
        }
      }

      if (!assigned) {
        unassigned.push({
          grupoId: grupo.id,
          grupoCodigo: grupo.codigo,
          razon: 'No se encontró slot factible',
        });
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
      },
    };
  }
}

module.exports = { GreedyStrategy };
