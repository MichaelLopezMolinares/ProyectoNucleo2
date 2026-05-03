const { query } = require('../../../config/database');

class ClassroomRepository {
  async findAll() {
    const { rows } = await query('SELECT * FROM classrooms ORDER BY building, name');
    return rows;
  }

  async findById(id) {
    const { rows } = await query('SELECT * FROM classrooms WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async create({ name, code, building, floor, capacity, type, features }) {
    const { rows } = await query(
      `INSERT INTO classrooms (name, code, building, floor, capacity, type, features)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, code, building, floor, capacity, type, JSON.stringify(features)]
    );
    return rows[0];
  }

  async update(id, data) {
    const { rows } = await query(
      `UPDATE classrooms SET name=$1, building=$2, floor=$3,
       capacity=$4, type=$5, features=$6 WHERE id=$7 RETURNING *`,
      [data.name, data.building, data.floor, data.capacity, data.type,
       JSON.stringify(data.features), id]
    );
    return rows[0];
  }

  // Aulas disponibles en un slot de tiempo (no ocupadas en ese horario)
  async findAvailableForSlot(dayOfWeek, startTime, endTime, minCapacity = 0) {
    const { rows } = await query(
      `SELECT c.* FROM classrooms c
       WHERE c.capacity >= $4
         AND c.id NOT IN (
           SELECT sa.classroom_id FROM schedule_assignments sa
           WHERE sa.day_of_week = $1
             AND sa.start_time < $3
             AND sa.end_time > $2
         )
       ORDER BY c.capacity`,
      [dayOfWeek, startTime, endTime, minCapacity]
    );
    return rows;
  }
}

module.exports = new ClassroomRepository();
