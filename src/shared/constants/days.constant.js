/**
 * Constantes de días de la semana
 */
const DAYS = Object.freeze({
  LUNES: 'LUNES',
  MARTES: 'MARTES',
  MIERCOLES: 'MIERCOLES',
  JUEVES: 'JUEVES',
  VIERNES: 'VIERNES',
  SABADO: 'SABADO',
});

const DAYS_LIST = Object.values(DAYS);

module.exports = { DAYS, DAYS_LIST };
