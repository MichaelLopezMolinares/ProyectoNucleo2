const { query } = require('../../../config/database');

class ScheduleRepository {
  async findAll() {
    const { rows } = await query(
      'SELECT * FROM schedules ORDER BY year DESC, semester DESC'
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await query('SELECT * FROM schedules WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async create({ name, academicPeriod, year, semester, programId }) {
    const { rows } = await query(
      `INSERT INTO schedules (name, academic_period, year, semester, program_id, status)
       VALUES ($1, $2, $3, $4, $5, 'draft') RETURNING *`,
      [name, academicPeriod, year, semester, programId]
    );
    return rows[0];
  }

  async updateStatus(id, status) {
    const { rows } = await query(
      'UPDATE schedules SET status=$1, generated_at=NOW() WHERE id=$2 RETURNING *',
      [status, id]
    );
    return rows[0];
  }

  async saveAssignments(assignments) {
    const client = await require('../../../config/database').pool.connect();
    try {
      await client.query('BEGIN');
      for (const a of assignments) {
        await client.query(
          `INSERT INTO schedule_assignments
           (schedule_id, group_id, teacher_id, classroom_id, day_of_week, start_time, end_time)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [a.scheduleId, a.groupId, a.teacherId, a.classroomId, a.dayOfWeek, a.startTime, a.endTime]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async deleteAssignments(scheduleId) {
    await query('DELETE FROM schedule_assignments WHERE schedule_id = $1', [scheduleId]);
  }

  async findAssignments(scheduleId) {
    const { rows } = await query(
      `SELECT sa.*,
              g.code as group_code, s.name as subject_name,
              t.first_name || ' ' || t.last_name as teacher_name,
              c.name as classroom_name, c.building
       FROM schedule_assignments sa
       JOIN groups g ON sa.group_id = g.id
       JOIN subjects s ON g.subject_id = s.id
       JOIN teachers t ON sa.teacher_id = t.id
       JOIN classrooms c ON sa.classroom_id = c.id
       WHERE sa.schedule_id = $1
       ORDER BY sa.day_of_week, sa.start_time`,
      [scheduleId]
    );
    return rows;
  }
}

module.exports = new ScheduleRepository();
