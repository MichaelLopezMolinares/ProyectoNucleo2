/**
 * ═══════════════════════════════════════════════════════════════
 * SERVICIO: GENERADOR DE HORARIOS — v2 (multi-asignatura)
 * ═══════════════════════════════════════════════════════════════
 *
 * Cambio principal respecto a v1:
 *   Antes: iteraba sobre `grupos` (1 grupo = 1 asignatura)
 *   Ahora: itera sobre `grupo_asignaturas` (1 grupo → N asignaturas)
 *
 * Cada fila de grupo_asignaturas representa una "unidad programable":
 *   G1 + Bases de Datos   → necesita 2 bloques semanales
 *   G1 + Programación OO  → necesita 2 bloques semanales
 *   G2 + Cálculo          → necesita 2 bloques semanales
 *   ...
 *
 * El generador asigna cada unidad en días/horas/aulas distintos,
 * respetando todas las restricciones (docente, aula, grupo, tiempo).
 *
 * La regla GroupConflictRule garantiza que G1 no tenga dos
 * asignaturas al mismo tiempo (usa grupo_id, no ga.id).
 * ═══════════════════════════════════════════════════════════════
 */
const { ScheduleEngineRepository }   = require('../repositories/schedule-engine.repository');
const { GrupoAsignaturaRepository }  = require('../../academic/repositories/grupo-asignatura.repository');
const { ConstraintValidatorService } = require('../../constraint-engine');
const { TeacherService }             = require('../../teacher/services/teacher.service');
const { ClassroomService }           = require('../../classroom/services/classroom.service');
const { GreedyStrategy }             = require('./strategies/greedy.strategy');
const { BacktrackingStrategy }       = require('./strategies/backtracking.strategy');
const { DAYS_LIST }                  = require('../../../shared/constants/days.constant');
const { TIME_SLOTS }                 = require('../../../shared/constants/time-slots.constant');
const { NotFoundException, AppException } = require('../../../shared/exceptions');

class ScheduleGeneratorService {
  constructor() {
    this.repository              = new ScheduleEngineRepository();
    this.grupoAsignaturaRepo     = new GrupoAsignaturaRepository();
    this.constraintValidator     = new ConstraintValidatorService();
    this.teacherService          = new TeacherService();
    this.classroomService        = new ClassroomService();

    this.strategies = new Map([
      ['greedy',        new GreedyStrategy()],
      ['backtracking',  new BacktrackingStrategy()],
    ]);
  }

  /**
   * Genera un horario completo para un periodo académico.
   * @param {import('../dto/schedule-engine.dto').GenerateScheduleDTO} dto
   */
  async generateSchedule(dto) {
    // ── 1. Seleccionar estrategia ─────────────────────────────
    const strategy = this.strategies.get(dto.estrategia);
    if (!strategy) {
      throw new AppException(
        `Estrategia "${dto.estrategia}" no disponible. Opciones: ${[...this.strategies.keys()].join(', ')}`,
        400, 'INVALID_STRATEGY'
      );
    }

    // ── 2. Cargar unidades programables (grupo × asignatura) ──
    //
    // Cada elemento tiene la forma:
    // {
    //   id:               UUID de grupo_asignaturas   ← clave del bloque
    //   grupoId:          UUID del grupo real
    //   grupoCodigo:      'G1'
    //   capacidad:        30
    //   jornada:          'DIURNA'
    //   asignaturaId:     UUID
    //   asignaturaNombre: 'Bases de Datos I'
    //   docenteId:        UUID | null
    //   horasSemanales:   4
    // }
    const grupoAsignaturas = await this.grupoAsignaturaRepo.findByPeriodo(dto.periodoId);

    if (grupoAsignaturas.length === 0) {
      throw new AppException(
        'No hay asignaturas registradas para los grupos de este periodo',
        400, 'NO_GRUPO_ASIGNATURAS'
      );
    }

    // ── 3. Aulas disponibles ──────────────────────────────────
    const aulas = await this.classroomService.findAll({});
    if (aulas.length === 0) {
      throw new AppException('No hay aulas registradas en el sistema', 400, 'NO_CLASSROOMS');
    }

    // ── 4. Disponibilidad de docentes ─────────────────────────
    const disponibilidadDocentes = new Map();
    const docenteIds = [...new Set(grupoAsignaturas.map(ga => ga.docenteId).filter(Boolean))];
    for (const docenteId of docenteIds) {
      const disp = await this.teacherService.getDisponibilidad(docenteId);
      disponibilidadDocentes.set(docenteId, disp);
    }

    // ── 5. Mapas de lookup ────────────────────────────────────
    const aulasMap = new Map(aulas.map(a => [a.id, a]));

    // gruposMap: el motor de restricciones lo usa para reglas de capacidad/grupo.
    // Construimos entradas por grupoId (para GroupConflictRule) y por ga.id
    // (para que el generador encuentre el objeto al hacer context.grupos.get(ga.id)).
    //
    // Usamos un proxy que responde a AMBAS claves:
    //   - context.grupos.get(grupoId)  → retorna { id: grupoId, capacidad, ... }
    //   - context.grupos.get(ga.id)    → retorna { id: grupoId, capacidad, ... }
    const gruposMap = new Map();
    for (const ga of grupoAsignaturas) {
      const entry = {
        id:       ga.grupoId,      // ← grupoId real (usado por GroupConflictRule)
        codigo:   ga.grupoCodigo,
        capacidad: ga.capacidad,
        jornada:  ga.jornada,
      };
      gruposMap.set(ga.grupoId, entry); // clave por grupoId
      gruposMap.set(ga.id,      entry); // clave por ga.id (para CapacityConflictRule)
    }

    // ── 6. Adaptar ga al formato que esperan las estrategias ──
    //
    // Las estrategias esperan objetos con:
    //   { id, codigo, docenteId, horasSemanales }
    //
    // Mapeamos cada ga a ese formato, pero conservando:
    //   - id          = ga.id (UUID de grupo_asignaturas)  ← clave de la asignación
    //   - grupoId     = ga.grupoId                         ← usado en asignaciones y conflictos
    //
    // IMPORTANTE: las asignaciones generadas usarán `grupo_id = ga.id`.
    // GroupConflictRule compara `newAssignment.grupo_id === existing.grupo_id`,
    // lo que significa que compararía ga.id con ga.id — eso NO detecta que
    // G1-Bases y G1-Programación son el mismo grupo real.
    //
    // Solución: las estrategias ya pasan `grupo_id` al candidato.
    // Nosotros le añadimos `grupo_real_id` y ajustamos GroupConflictRule,
    // O más simple: usamos grupoId como grupo_id en el candidato y
    // ga.id como identificador de qué asignatura es.
    //
    // Elegimos la forma más simple: el campo `grupo_id` en la asignación
    // referencia al GRUPO REAL (grupoId), y añadimos `ga_id` para persistir
    // la FK correcta a grupo_asignaturas en la tabla asignaciones.
    const unidadesProgramables = grupoAsignaturas.map(ga => ({
      id:             ga.grupoId,        // grupo_id en asignación → grupo real
      ga_id:          ga.id,             // FK a grupo_asignaturas (para persistir)
      codigo:         `${ga.grupoCodigo}-${ga.asignaturaCodigo || ga.asignaturaNombre}`,
      docenteId:      ga.docenteId,
      horasSemanales: ga.horasSemanales,
      // metadata útil para logs/respuesta
      grupoCodigo:    ga.grupoCodigo,
      asignaturaNombre: ga.asignaturaNombre,
    }));

    const timeSlots = Object.values(TIME_SLOTS);

    // ── 7. Crear registro de horario en BD ────────────────────
    const horario = await this.repository.createHorario({
      periodoId:   dto.periodoId,
      estrategia:  dto.estrategia,
      generadoPor: dto.userId,
    });

    try {
      // ── 8. Ejecutar la estrategia ───────────────────────────
      const result = await strategy.generate({
        grupos:               unidadesProgramables,
        aulas,
        disponibilidadDocentes,
        aulasMap,
        gruposMap,
        constraintValidator:  this.constraintValidator,
        timeSlots,
        days: DAYS_LIST,
      });

      // ── 9. Persistir asignaciones ───────────────────────────
      let savedAsignaciones = [];
      if (result.assignments.length > 0) {
        const asignaciones = result.assignments.map(a => ({
          horarioId:  horario.id,
          grupoId:    a.grupo_id,           // grupoId real
          aulaId:     a.aula_id,
          docenteId:  a.docente_id,
          dia:        a.dia,
          horaInicio: a.hora_inicio,
          horaFin:    a.hora_fin,
        }));

        savedAsignaciones = await this.repository.createAsignacionesBatch(asignaciones);
      }

      // ── 10. Validación post-generación ──────────────────────
      const validation = this.constraintValidator.validateSchedule(
        result.assignments,
        { disponibilidadDocentes, aulas: aulasMap, grupos: gruposMap }
      );

      const conflictosCorregidos = validation.conflicts.map(c => {
        const asignacionA = result.assignments.find(a =>
          a.grupo_id    === c.grupo_id_a &&
          a.dia         === c.dia        &&
          a.hora_inicio === c.hora_inicio
        );
        const asignacionB = c.grupo_id_b
          ? result.assignments.find(a =>
              a.grupo_id    === c.grupo_id_b &&
              a.dia         === c.dia        &&
              a.hora_inicio === c.hora_inicio
            )
          : null;

        return {
          tipo:        c.tipo,
          severidad:   c.severidad,
          descripcion: c.descripcion,
          asignacionA: asignacionA?.id || null,
          asignacionB: asignacionB?.id || null,
        };
      });

      // ── 11. Persistir conflictos ────────────────────────────
      if (validation.conflicts.length > 0) {
        await this.repository.saveConflictos(horario.id, conflictosCorregidos);
      }

      // ── 12. Actualizar estado ───────────────────────────────
      const estado = validation.valid ? 'VALIDADO' : 'BORRADOR';
      await this.repository.updateHorarioEstado(horario.id, estado);

      return {
        horarioId:  horario.id,
        estado,
        generacion: result.stats,
        validacion: validation.stats,
        noAsignados: result.unassigned,
        resumen: {
          totalGrupos:       [...new Set(unidadesProgramables.map(u => u.id))].length,
          totalAsignaturas:  unidadesProgramables.length,
          totalBloques:      result.assignments.length,
        },
      };
    } catch (error) {
      await this.repository.deleteHorario(horario.id);
      throw error;
    }
  }

  getAvailableStrategies() {
    return [...this.strategies.keys()];
  }

  registerStrategy(name, strategy) {
    this.strategies.set(name, strategy);
  }

  async getHorarioDetail(horarioId) {
    const horario = await this.repository.findHorarioById(horarioId);
    if (!horario) throw new NotFoundException('Horario', horarioId);
    const asignaciones = await this.repository.findAsignacionesByHorario(horarioId);
    const conflictos   = await this.repository.findConflictosByHorario(horarioId);
    return { horario, asignaciones, conflictos };
  }

  async publishHorario(horarioId) {
    const horario = await this.repository.findHorarioById(horarioId);
    if (!horario) throw new NotFoundException('Horario', horarioId);
    if (horario.estado !== 'VALIDADO') {
      throw new AppException(
        'Solo se pueden publicar horarios en estado VALIDADO',
        400, 'INVALID_STATE'
      );
    }
    return this.repository.updateHorarioEstado(horarioId, 'PUBLICADO');
  }
}

module.exports = { ScheduleGeneratorService };