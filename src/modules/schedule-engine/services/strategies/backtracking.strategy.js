/**
 * ═══════════════════════════════════════════════════════════════
 * ESTRATEGIA BACKTRACKING — v2 (multi-bloque + distribución semanal)
 * ═══════════════════════════════════════════════════════════════
 *
 * CAMBIOS RESPECTO A v1:
 *
 * 1. MULTI-BLOQUE: igual que el greedy, cada grupo necesita
 *    `ceil(horasSemanales / 2)` bloques semanales. La v1 solo
 *    asignaba 1 slot por grupo, ignorando horasSemanales.
 *
 * 2. DISTRIBUCIÓN SEMANAL: cada bloque de un mismo grupo se
 *    fuerza a ir en un día distinto (misma lógica que greedy).
 *    El backtracking respeta esto al generar las opciones:
 *    ordena los slots poniendo primero los días no usados.
 *
 * 3. MODELO MULTI-ASIGNATURA: grupo.id es el grupoId real,
 *    grupo_id en el candidato también → GroupConflictRule
 *    detecta colisiones entre asignaturas del mismo grupo.
 *
 * CÓMO FUNCIONA:
 *   - Para cada "unidad programable" (grupo × asignatura)
 *     genera N bloques (según horasSemanales).
 *   - Cada bloque se trata como un nodo en el árbol de búsqueda.
 *   - Si un bloque no tiene slot factible → retrocede al bloque
 *     anterior y prueba la siguiente opción (backtrack real).
 *   - Límite de MAX_BACKTRACKS para evitar loops exponenciales.
 *
 * VENTAJA sobre greedy: puede deshacer asignaciones previas para
 * encontrar combinaciones que el greedy habría descartado.
 * ═══════════════════════════════════════════════════════════════
 */
const { ScheduleStrategy } = require('./schedule-strategy.interface');

const BLOCK_SIZE = 2; // horas por bloque

class BacktrackingStrategy extends ScheduleStrategy {
  constructor() {
    super('backtracking');
    this.MAX_BACKTRACKS = 10000;
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
    let backtracks = 0;
    let attempts   = 0;

    // Ordenar: más horas primero (más difíciles de encajar)
    const sortedGrupos = [...grupos].sort(
      (a, b) => (b.horasSemanales || BLOCK_SIZE) - (a.horasSemanales || BLOCK_SIZE)
    );

    // Expandir grupos en bloques individuales
    // Cada bloque es una "tarea de asignación" independiente
    const tasks = [];
    for (const grupo of sortedGrupos) {
      const blocksNeeded = Math.ceil((grupo.horasSemanales || BLOCK_SIZE) / BLOCK_SIZE);
      for (let i = 0; i < blocksNeeded; i++) {
        tasks.push({ grupo, blockIdx: i, totalBlocks: blocksNeeded });
      }
    }

    const context = { disponibilidadDocentes, aulas: aulasMap, grupos: gruposMap };

    // assignments[i] = candidato asignado a tasks[i], o null si aún no asignado
    const assignments = new Array(tasks.length).fill(null);

    /**
     * Genera los candidatos para una tarea, priorizando:
     *   1. Días que el grupo AÚN NO usa (distribución semanal)
     *   2. Días que ya usa (solo si no hay otra opción)
     *   Dentro de cada grupo de días: orden natural de slots y aulas
     */
    const getCandidates = (taskIndex) => {
      const { grupo } = tasks[taskIndex];

      // Días ya usados por bloques anteriores DE ESTE GRUPO
      const diasUsados = new Set(
        assignments
          .slice(0, taskIndex)
          .filter(a => a !== null && a.grupo_id === grupo.id)
          .map(a => a.dia)
      );

      const diasLibres  = days.filter(d => !diasUsados.has(d));
      const diasRepeat  = days.filter(d =>  diasUsados.has(d));
      const orderedDays = [...diasLibres, ...diasRepeat];

      const candidates = [];
      for (const dia of orderedDays) {
        for (const slot of timeSlots) {
          for (const aula of aulas) {
            candidates.push({
              grupo_id:    grupo.id,
              docente_id:  grupo.docenteId || null,
              aula_id:     aula.id,
              dia,
              hora_inicio: slot.start,
              hora_fin:    slot.end,
            });
          }
        }
      }
      return candidates;
    };

    // Índice de qué candidato se está probando para cada tarea
    // (permite retomar desde donde se quedó al hacer backtrack)
    const candidateIndex = new Array(tasks.length).fill(0);
    const candidateCache = new Array(tasks.length).fill(null);

    /**
     * Backtracking iterativo (evita stack overflow en árboles grandes)
     */
    let taskIdx = 0;
    while (taskIdx < tasks.length && taskIdx >= 0) {
      if (backtracks >= this.MAX_BACKTRACKS) break;

      // Generar candidatos la primera vez que visitamos esta tarea
      if (candidateCache[taskIdx] === null) {
        candidateCache[taskIdx] = getCandidates(taskIdx);
        candidateIndex[taskIdx] = 0;
      }

      const candidates = candidateCache[taskIdx];
      let found = false;

      while (candidateIndex[taskIdx] < candidates.length) {
        const candidate = candidates[candidateIndex[taskIdx]];
        candidateIndex[taskIdx]++;
        attempts++;

        // Asignaciones actuales confirmadas (excluye la tarea actual)
        const current = assignments.slice(0, taskIdx).filter(Boolean);

        const isFeasible = constraintValidator.isFeasible(candidate, current, context);

        if (isFeasible) {
          assignments[taskIdx] = candidate;
          found = true;
          break;
        }
      }

      if (found) {
        taskIdx++; // Avanzar a la siguiente tarea
      } else {
        // Backtrack: limpiar esta tarea y volver a la anterior
        assignments[taskIdx]     = null;
        candidateCache[taskIdx]  = null; // resetear para regenerar con contexto fresco
        candidateIndex[taskIdx]  = 0;
        taskIdx--;
        backtracks++;

        // Avanzar el índice de la tarea anterior para no repetir el mismo candidato
        if (taskIdx >= 0) {
          assignments[taskIdx] = null;
          // El cache de taskIdx se mantiene para continuar desde donde estaba
        }
      }
    }

    const solved       = taskIdx >= tasks.length;
    const finalAssign  = assignments.filter(Boolean);

    // Detectar grupos no asignados
    const unassigned = [];
    if (!solved) {
      // Contar bloques asignados por grupo
      const assignedCountByGrupo = {};
      for (const a of finalAssign) {
        assignedCountByGrupo[a.grupo_id] = (assignedCountByGrupo[a.grupo_id] || 0) + 1;
      }

      for (const grupo of sortedGrupos) {
        const needed  = Math.ceil((grupo.horasSemanales || BLOCK_SIZE) / BLOCK_SIZE);
        const got     = assignedCountByGrupo[grupo.id] || 0;
        if (got < needed) {
          for (let b = got; b < needed; b++) {
            unassigned.push({
              grupoId:     grupo.id,
              grupoCodigo: grupo.codigo,
              bloque:      b + 1,
              razon: backtracks >= this.MAX_BACKTRACKS
                ? 'Límite de backtracking alcanzado'
                : 'No se encontró slot factible',
            });
          }
        }
      }
    }

    return {
      assignments: finalAssign,
      unassigned,
      stats: {
        strategy:        this.name,
        totalGrupos:     grupos.length,
        totalTareas:     tasks.length,
        assigned:        finalAssign.length,
        unassigned:      unassigned.length,
        attempts,
        backtracks,
        solutionComplete: solved,
      },
    };
  }
}

module.exports = { BacktrackingStrategy };