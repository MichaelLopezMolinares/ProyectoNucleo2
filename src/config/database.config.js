/**
 * Configuración de base de datos PostgreSQL
 */
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME || 'agenda_facil',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  poolMin: parseInt(process.env.DB_POOL_MIN, 10) || 2,
  poolMax: parseInt(process.env.DB_POOL_MAX, 10) || 10,
};

module.exports = { dbConfig };
