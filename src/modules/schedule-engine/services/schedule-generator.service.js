/**
 * ═══════════════════════════════════════════════════════════════
 * SERVICIO: GENERADOR DE HORARIOS
 * ═══════════════════════════════════════════════════════════════
 *
 * Componente central del sistema. Orquesta:
 * 1. Carga de datos (grupos, docentes, aulas, disponibilidad)
 * 2. Selección de estrategia de generación (Strategy Pattern)
 * 3. Ejecución de la generación incremental
 * 4. Validación post-generación con el motor de restricciones
 * 5. Persistencia de resultados y conflictos
 *
 * Comunicación entre módulos:
 * - Usa GrupoService (academic) para obtener grupos del periodo
 * - Usa TeacherService (teacher) para disponibilidad de docentes
 * - Usa ClassroomService (classroom) para aulas disponibles
 * - Usa ConstraintValidatorService (constraint-engine) para validar
 * ═══════════════════════════════════════════════════════════════
 */
const { ScheduleEngineRepository } = require('../repositories/schedule-engine.repository');
const { ConstraintValidatorService } = require('../../constraint-engine');
const { GrupoService } = require('../../academic/services/grupo.service');
const { TeacherService } = require('../../teacher/services/teacher.service');
const { ClassroomService } = require('../../classroom/services/classroom.service');
const { GreedyStrategy } = require('./strategies/greedy.strategy');
const { BacktrackingStrategy } = require('./strategies/backtracking.strategy');
const { DAYS_LIST } = require('../../../shared/constants/days.constant');
const { TIME_SLOTS } = require('../../../shared/constants/time-slots.constant');
const { NotFoundException, AppException } = require('../../../shared/exceptions');

class ScheduleGeneratorService {
  constructor() {
    this.repository = new ScheduleEngineRepository();
    this.constraintValidator = new ConstraintValidatorService();
    this.grupoService = new GrupoService();
    this.teacherService = new TeacherService();
    this.classroomService = new ClassroomService();

    // Registro de estrategias intercambiables (Strategy Pattern)
    this.strategies = new Map([
      ['greedy', new GreedyStrategy()],
      ['backtracking', new BacktrackingStrategy()],
    ]);
  }

  /**
   * Genera un horario completo para un periodo académico
   * @param {import('../dto/schedule-engine.dto').GenerateScheduleDTO} dto
   * @returns {Promise<object>} Resultado de la generación
   */
  async generateSchedule(dto) {
    // 1. Seleccionar estrategia
    const strategy = this.strategies.get(dto.estrategia);
    if (!strategy) {
      throw new AppException(
        `Estrategia "${dto.estrategia}" no disponible. Opciones: ${[...this.strategies.keys()].join(', ')}`,
        400,
        'INVALID_STRATEGY'
      );
    }

    // 2. Cargar datos necesarios de otros módulos
    const grupos = await this.grupoService.findByPeriodo(dto.periodoId);
    if (grupos.length === 0) {
      throw new AppException('No hay grupos registrados para este periodo', 400, 'NO_GROUPS');
    }

    const aulas = await this.classroomService.findAll({});
    if (aulas.length === 0) {
      throw new AppException('No hay aulas registradas en el sistema', 400, 'NO_CLASSROOMS');
    }

    // Cargar disponibilidad de docentes
    const disponibilidadDocentes = new Map();
    const docenteIds = [...new Set(grupos.map(g => g.docenteId).filter(Boolean))];
    for (const docenteId of docenteIds) {
      const disp = await this.teacherService.getDisponibilidad(docenteId);
      disponibilidadDocentes.set(docenteId, disp);
    }

    // Crear mapas de lookup
    const aulasMap = new Map(aulas.map(a => [a.id, a]));
    const gruposMap = new Map(grupos.map(g => [g.id, g]));

    // Convertir time slots a array
    const timeSlots = Object.values(TIME_SLOTS);

    // 3. Crear registro de horario en BD
    const horario = await this.repository.createHorario({
      periodoId: dto.periodoId,
      estrategia: dto.estrategia,
      generadoPor: dto.userId,
    });

    try {
      // 4. Ejecutar la estrategia de generación
      const result = await strategy.generate({
        grupos,
        aulas,
        disponibilidadDocentes,
        aulasMap,
        gruposMap,
        constraintValidator: this.constraintValidator,
        timeSlots,
        days: DAYS_LIST,
      });

      // 5. Persistir asignaciones
      if (result.assignments.length > 0) {
        const asignaciones = result.assignments.map(a => ({
          horarioId: horario.id,
          grupoId: a.grupo_id,
          aulaId: a.aula_id,
          docenteId: a.docente_id,
          dia: a.dia,
          horaInicio: a.hora_inicio,
          horaFin: a.hora_fin,
        }));

        await this.repository.createAsignacionesBatch(asignaciones);
      }

      // 6. Validación post-generación (completa)
      const validation = this.constraintValidator.validateSchedule(
        result.assignments,
        { disponibilidadDocentes, aulas: aulasMap, grupos: gruposMap }
      );

      const conflictosCorregidos = validation.conflicts.map(c => {
  // Buscar la asignación exacta usando grupo_id + dia + hora_inicio
  // (el ConstraintValidatorService debería incluir estos campos en el conflicto)
  const asignacionA = result.assignments.find(a =>
    a.grupo_id   === c.grupo_id_a &&
    a.dia        === c.dia        &&
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
    // ✔ UUIDs limpios — el repo los inserta directamente como FK
    asignacionA: asignacionA?.id || null,
    asignacionB: asignacionB?.id || null,
  };
});

      // 7. Persistir conflictos detectados
      if (validation.conflicts.length > 0) {
        await this.repository.saveConflictos(horario.id, conflictosCorregidos);
      }

      // 8. Actualizar estado del horario
      const estado = validation.valid ? 'VALIDADO' : 'BORRADOR';
      await this.repository.updateHorarioEstado(horario.id, estado);

      return {
        horarioId: horario.id,
        estado,
        generacion: result.stats,
        validacion: validation.stats,
        noAsignados: result.unassigned,
      };
    } catch (error) {
      // Rollback: eliminar horario si falla la generación
      await this.repository.deleteHorario(horario.id);
      throw error;
    }
  }

  /**
   * Obtiene las estrategias disponibles
   */
  getAvailableStrategies() {
    return [...this.strategies.keys()];
  }

  /**
   * Registra una nueva estrategia (extensibilidad)
   */
  registerStrategy(name, strategy) {
    this.strategies.set(name, strategy);
  }

  /**
   * Obtiene un horario con sus conflictos
   */
  async getHorarioDetail(horarioId) {
    const horario = await this.repository.findHorarioById(horarioId);
    if (!horario) throw new NotFoundException('Horario', horarioId);

    const asignaciones = await this.repository.findAsignacionesByHorario(horarioId);
    const conflictos = await this.repository.findConflictosByHorario(horarioId);

    return { horario, asignaciones, conflictos };
  }

  /**
   * Publica un horario (cambia estado a PUBLICADO)
   */
  async publishHorario(horarioId) {
    const horario = await this.repository.findHorarioById(horarioId);
    if (!horario) throw new NotFoundException('Horario', horarioId);

    if (horario.estado !== 'VALIDADO') {
      throw new AppException(
        'Solo se pueden publicar horarios en estado VALIDADO',
        400,
        'INVALID_STATE'
      );
    }

    return this.repository.updateHorarioEstado(horarioId, 'PUBLICADO');
  }
}

module.exports = { ScheduleGeneratorService };
