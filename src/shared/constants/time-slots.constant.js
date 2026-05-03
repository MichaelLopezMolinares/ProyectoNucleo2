/**
 * Constantes de franjas horarias
 */
const TIME_SLOTS = Object.freeze({
  SLOT_1: { start: '06:00', end: '08:00', label: 'Franja 1 (6:00 - 8:00)' },
  SLOT_2: { start: '08:00', end: '10:00', label: 'Franja 2 (8:00 - 10:00)' },
  SLOT_3: { start: '10:00', end: '12:00', label: 'Franja 3 (10:00 - 12:00)' },
  SLOT_4: { start: '12:00', end: '14:00', label: 'Franja 4 (12:00 - 14:00)' },
  SLOT_5: { start: '14:00', end: '16:00', label: 'Franja 5 (14:00 - 16:00)' },
  SLOT_6: { start: '16:00', end: '18:00', label: 'Franja 6 (16:00 - 18:00)' },
  SLOT_7: { start: '18:00', end: '20:00', label: 'Franja 7 (18:00 - 20:00)' },
  SLOT_8: { start: '20:00', end: '22:00', label: 'Franja 8 (20:00 - 22:00)' },
});

module.exports = { TIME_SLOTS };
