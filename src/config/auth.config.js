/**
 * Configuración JWT y seguridad
 */
require('dotenv').config();

const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
};

module.exports = { authConfig };
