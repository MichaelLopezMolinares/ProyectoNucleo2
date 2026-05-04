/**
 * Constantes de roles de usuario
 */
const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  COORDINADOR: 'COORDINADOR',
  DOCENTE: 'DOCENTE',
  CONSULTA: 'CONSULTA',
});

const ROLES_LIST = Object.values(ROLES);

module.exports = { ROLES, ROLES_LIST };
