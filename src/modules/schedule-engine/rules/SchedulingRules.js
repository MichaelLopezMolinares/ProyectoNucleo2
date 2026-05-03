/**
 * Reglas de negocio configurables del motor de horarios.
 * Centraliza las restricciones de dominio.
 */
const SchedulingRules = {
  MIN_SESSION_DURATION_HOURS: 1,
  MAX_SESSION_DURATION_HOURS: 4,
  MAX_SESSIONS_PER_DAY_PER_GROUP: 2,
  WORKING_DAYS: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
  DEFAULT_SESSION_DURATION_HOURS: 2,

  WORKING_HOURS: {
    start: '06:00',
    end: '22:00',
  },

  generateDefaultSlots() {
    const slots = [];
    const days = this.WORKING_DAYS;
    const timeBlocks = [
      { startTime: '06:00', endTime: '08:00' },
      { startTime: '08:00', endTime: '10:00' },
      { startTime: '10:00', endTime: '12:00' },
      { startTime: '12:00', endTime: '14:00' },
      { startTime: '14:00', endTime: '16:00' },
      { startTime: '16:00', endTime: '18:00' },
      { startTime: '18:00', endTime: '20:00' },
      { startTime: '20:00', endTime: '22:00' },
    ];

    for (const day of days) {
      for (const block of timeBlocks) {
        slots.push({ dayOfWeek: day, ...block });
      }
    }
    return slots;
  },
};

module.exports = SchedulingRules;
