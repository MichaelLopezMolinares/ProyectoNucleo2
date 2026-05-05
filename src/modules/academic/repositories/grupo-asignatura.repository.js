/**
 * Repositorio: GrupoAsignaturas
 *
 * Maneja la relación N:M entre grupos y asignaturas.
 * Un grupo (G1, G2...) puede cursar múltiples asignaturas,
 * cada una con su docente asignado y carga horaria propia.
 */
const { sequelize } = require('../../../database/sequelize');

class GrupoAsignaturaRepository {
  /**
   * Retorna todas las asignaciones grupo-asignatura de un periodo.
   * Hace JOIN con grupos para filtrar por periodo_id.
   *
   * El resultado incluye campos "aplanados" que el generador de
   * horarios necesita para tratar cada fila como una unidad
   * programable independiente:
   *   - id          → UUID de grupo_asignaturas (es el "grupo lógico" a programar)
   *   - grupoId     → UUID del grupo real
   *   - grupoCodigo → Ej: "G1"
   *   - asignaturaId
   *   - docenteId
   *   - horasSemanales
   *   - capacidad   → del grupo (para regla de capacidad)
   *   - jornada     → del grupo (DIURNA / NOCTURNA)
   *
   * @param {string} periodoId
   * @returns {Promise<Array>}
   */
  async findByPeriodo(periodoId) {
    const [rows] = await sequelize.query(
      `SELECT
         ga.id,
         ga.grupo_id        AS "grupoId",
         g.codigo           AS "grupoCodigo",
         g.capacidad,
         g.jornada,
         ga.asignatura_id   AS "asignaturaId",
         a.nombre           AS "asignaturaNombre",
         a.codigo           AS "asignaturaCodigo",
         ga.docente_id      AS "docenteId",
         ga.horas_semanales AS "horasSemanales"
       FROM grupo_asignaturas ga
       JOIN grupos      g ON g.id = ga.grupo_id
       JOIN asignaturas a ON a.id = ga.asignatura_id
       WHERE g.periodo_id = :periodoId
         AND g.activo     = TRUE
         AND ga.activo    = TRUE
       ORDER BY g.codigo, a.nombre`,
      { replacements: { periodoId } }
    );
    return rows;
  }

  /**
   * Crea una relación grupo-asignatura
   */
  async create({ grupoId, asignaturaId, docenteId, horasSemanales = 4 }) {
    const [rows] = await sequelize.query(
      `INSERT INTO grupo_asignaturas
         (grupo_id, asignatura_id, docente_id, horas_semanales)
       VALUES
         (:grupoId, :asignaturaId, :docenteId, :horasSemanales)
       RETURNING *`,
      { replacements: { grupoId, asignaturaId, docenteId, horasSemanales } }
    );
    return rows[0];
  }

  /**
   * Actualiza docente u horas de una relación
   */
  async update(id, { docenteId, horasSemanales, activo }) {
    const [rows] = await sequelize.query(
      `UPDATE grupo_asignaturas
       SET docente_id      = COALESCE(:docenteId,      docente_id),
           horas_semanales = COALESCE(:horasSemanales, horas_semanales),
           activo          = COALESCE(:activo,         activo),
           updated_at      = NOW()
       WHERE id = :id
       RETURNING *`,
      { replacements: { id, docenteId, horasSemanales, activo } }
    );
    return rows[0] || null;
  }

  async delete(id) {
    await sequelize.query(
      'DELETE FROM grupo_asignaturas WHERE id = :id',
      { replacements: { id } }
    );
  }

  /**
   * Lista todas las asignaturas de un grupo específico
   */
  async findByGrupo(grupoId) {
    const [rows] = await sequelize.query(
      `SELECT ga.*, a.nombre AS "asignaturaNombre", a.codigo AS "asignaturaCodigo"
       FROM grupo_asignaturas ga
       JOIN asignaturas a ON a.id = ga.asignatura_id
       WHERE ga.grupo_id = :grupoId AND ga.activo = TRUE
       ORDER BY a.nombre`,
      { replacements: { grupoId } }
    );
    return rows;
  }
}

module.exports = { GrupoAsignaturaRepository };