/**
 * Pool de conexiones PostgreSQL
 */
const { Pool } = require('pg');
const { dbConfig } = require('../config/database.config');

const pool = new Pool({
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  password: dbConfig.password,
  min: dbConfig.poolMin,
  max: dbConfig.poolMax,
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
  process.exit(-1);
});

/**
 * Helper para ejecutar queries con liberación automática de conexión
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Query ejecutada', { text: text.substring(0, 80), duration: `${duration}ms`, rows: result.rowCount });
  }
  return result;
};

/**
 * Obtener un cliente del pool para transacciones
 * @returns {Promise<import('pg').PoolClient>}
 */
const getClient = async () => {
  return pool.connect();
};

module.exports = { pool, query, getClient };
