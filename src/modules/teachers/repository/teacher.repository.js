const { query } = require('../../../config/database');

class TeacherRepository {
  async findAll() {
    const { rows } = await query(
      'SELECT * FROM teachers ORDER BY last_name, first_name'
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await query('SELECT * FROM teachers WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async findByEmail(email) {
    const { rows } = await query('SELECT * FROM teachers WHERE email = $1', [email]);
    return rows[0] || null;
  }

  async create({ firstName, lastName, email, identificationNumber, contractType, maxHoursPerWeek }) {
    const { rows } = await query(
      `INSERT INTO teachers (first_name, last_name, email, identification_number, contract_type, max_hours_per_week)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [firstName, lastName, email, identificationNumber, contractType, maxHoursPerWeek]
    );
    return rows[0];
  }

  async update(id, data) {
    const { rows } = await query(
      `UPDATE teachers SET first_name=$1, last_name=$2, email=$3,
       contract_type=$4, max_hours_per_week=$5 WHERE id=$6 RETURNING *`,
      [data.firstName, data.lastName, data.email, data.contractType, data.maxHoursPerWeek, id]
    );
    return rows[0];
  }

  async getAvailability(teacherId) {
    const { rows } = await query(
      'SELECT * FROM teacher_availability WHERE teacher_id = $1 ORDER BY day_of_week, start_time',
      [teacherId]
    );
    return rows;
  }

  async setAvailability(teacherId, slots) {
    await query('DELETE FROM teacher_availability WHERE teacher_id = $1', [teacherId]);
    for (const slot of slots) {
      await query(
        `INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time)
         VALUES ($1, $2, $3, $4)`,
        [teacherId, slot.dayOfWeek, slot.startTime, slot.endTime]
      );
    }
  }

  async findAvailableForSlot(dayOfWeek, startTime, endTime) {
    const { rows } = await query(
      `SELECT t.* FROM teachers t
       INNER JOIN teacher_availability ta ON t.id = ta.teacher_id
       WHERE ta.day_of_week = $1
         AND ta.start_time <= $2
         AND ta.end_time >= $3`,
      [dayOfWeek, startTime, endTime]
    );
    return rows;
  }
}

module.exports = new TeacherRepository();
