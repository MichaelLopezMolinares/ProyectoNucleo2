/**
 * Configuración del servidor
 */
require('dotenv').config();

const serverConfig = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

module.exports = { serverConfig };
