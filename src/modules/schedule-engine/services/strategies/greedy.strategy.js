/**
 * ═══════════════════════════════════════════════════════════════
 * ESTRATEGIA GREEDY — DISTRIBUCIÓN SEMANAL FORZADA
 * ═══════════════════════════════════════════════════════════════
 *
 * ROOT CAUSE DEL BUG "3 clases solo en Lunes":
 *
 * El greedy original itera días en orden fijo [LUNES, MARTES...].
 * El PRIMER slot factible se asigna → todos los grupos van al
 * primer slot del Lunes porque no hay nada que los obligue a
 * separarse en la semana. Con horasSemanales=2 (1 bloque),
 * el resultado es exactamente "N grupos, todos en Lunes".
 *
 * FIX: diaLoad — contador de asignaciones por día.
 * Cada bloque prioriza el día con menos carga global.
 * Resultado: distribución automática en toda la semana.
 * ═══════════════════════════════════════════════════════════════
 */
const { ScheduleStrategy } = require('./schedule-strategy.interface');

const BLOCK_SIZE = 2;

class GreedyStrategy extends ScheduleStrategy {
  constructor() {
    super('greedy');
  }

  async generate({
    grupos,
    aulas,
    disponibilidadDocentes,
    aulasMap,
    gruposMap,
    constraintValidator,
    timeSlots,
    days,
  }) {
    const assignments = [];
    const unassigned  = [];
    let attempts      = 0;

    // Contador de asignaciones por día — permite distribuir la carga en la semana
    const diaLoad = {};
    for (const d of days) diaLoad[d] = 0;

    // Heurística: grupos con más horas semanales primero (más difíciles de encajar)
    const sortedGrupos = [...grupos].sort(
      (a, b) => (b.horasSemanales || BLOCK_SIZE) - (a.horasSemanales || BLOCK_SIZE)
    );

    const context = { disponibilidadDocentes, aulas: aulasMap, grupos: gruposMap };

    for (const grupo of sortedGrupos) {
      const horasSemanales  = grupo.horasSemanales || BLOCK_SIZE;
      const blocksNeeded    = Math.ceil(horasSemanales / BLOCK_SIZE);
      const grupoAssignments = [];
      const usedSlots        = new Set(); // "dia-horaInicio" usados por este grupo

      for (let blockIdx = 0; blockIdx < blocksNeeded; blockIdx++) {
        let blockAssigned = false;

        // Días ya usados por bloques anteriores de ESTE grupo
        const diasDelGrupo = new Set(grupoAssignments.map(a => a.dia));

        // Orden de días:
        //   1º — días que este grupo aún NO ha usado (fuerza días distintos)
        //   2º — días que ya usó (solo si no hay otra opción)
        //   Dentro de cada grupo, ordenar por carga global ascendente
        const orderedDays = [
          ...days.filter(d => !diasDelGrupo.has(d)).sort((a, b) => diaLoad[a] - diaLoad[b]),
          ...days.filter(d =>  diasDelGrupo.has(d)).sort((a, b) => diaLoad[a] - diaLoad[b]),
        ];

        outerSearch:
        for (const dia of orderedDays) {
          for (const slot of timeSlots) {
            const slotKey = `${dia}-${slot.start}`;
            if (usedSlots.has(slotKey)) continue; // slot ya usado por este grupo

            for (const aula of aulas) {
              attempts++;

              const candidate = {
                grupo_id:    grupo.id,
                docente_id:  grupo.docenteId || null,
                aula_id:     aula.id,
                dia,
                hora_inicio: slot.start,
                hora_fin:    slot.end,
              };

              const isFeasible = constraintValidator.isFeasible(
                candidate,
                [...assignments, ...grupoAssignments],
                context
              );

              if (isFeasible) {
                grupoAssignments.push(candidate);
                usedSlots.add(slotKey);
                diaLoad[dia]++;
                blockAssigned = true;
                break outerSearch;
              }
            }
          }
        }

        if (!blockAssigned) {
          unassigned.push({
            grupoId:     grupo.id,
            grupoCodigo: grupo.codigo,
            bloque:      blockIdx + 1,
            razon:       'No se encontró slot factible para este bloque',
          });
        }
      }

      assignments.push(...grupoAssignments);
    }

    return {
      assignments,
      unassigned,
      stats: {
        strategy:    this.name,
        totalGrupos: grupos.length,
        assigned:    assignments.length,
        unassigned:  unassigned.length,
        attempts,
        distribucionPorDia: { ...diaLoad },
      },
    };
  }
}

module.exports = { GreedyStrategy };