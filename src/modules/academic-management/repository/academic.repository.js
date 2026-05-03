const { query } = require('../../../config/database');

class AcademicRepository {
  // ── Programas ──────────────────────────────────────
  async findAllPrograms() {
    const { rows } = await query('SELECT * FROM programs ORDER BY name');
    return rows;
  }

  async findProgramById(id) {
    const { rows } = await query('SELECT * FROM programs WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async createProgram({ name, code, faculty, semesters }) {
    const { rows } = await query(
      'INSERT INTO programs (name, code, faculty, semesters) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, code, faculty, semesters]
    );
    return rows[0];
  }

  async updateProgram(id, data) {
    const { rows } = await query(
      'UPDATE programs SET name=$1, code=$2, faculty=$3, semesters=$4 WHERE id=$5 RETURNING *',
      [data.name, data.code, data.faculty, data.semesters, id]
    );
    return rows[0];
  }

  async deleteProgram(id) {
    await query('DELETE FROM programs WHERE id = $1', [id]);
  }

  // ── Asignaturas ────────────────────────────────────
  async findSubjectsByProgram(programId) {
    const { rows } = await query(
      'SELECT * FROM subjects WHERE program_id = $1 ORDER BY semester, name',
      [programId]
    );
    return rows;
  }

  async findSubjectById(id) {
    const { rows } = await query('SELECT * FROM subjects WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async createSubject({ name, code, credits, hoursPerWeek, programId, semester }) {
    const { rows } = await query(
      `INSERT INTO subjects (name, code, credits, hours_per_week, program_id, semester)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, code, credits, hoursPerWeek, programId, semester]
    );
    return rows[0];
  }

  // ── Grupos ─────────────────────────────────────────
  async findGroupsBySubject(subjectId) {
    const { rows } = await query(
      'SELECT * FROM groups WHERE subject_id = $1',
      [subjectId]
    );
    return rows;
  }

  async findGroupById(id) {
    const { rows } = await query('SELECT * FROM groups WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async createGroup({ code, subjectId, semester, year, enrolledStudents }) {
    const { rows } = await query(
      `INSERT INTO groups (code, subject_id, semester, year, enrolled_students)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [code, subjectId, semester, year, enrolledStudents]
    );
    return rows[0];
  }
}

module.exports = new AcademicRepository();
