/**
 * Agenda Fácil – Punto de entrada del servidor
 * Monolito modular con arquitectura en capas
 */
const app = require('./src/app');
const { serverConfig } = require('./src/config/server.config');
const { pool } = require('./src/database/pool');

const PORT = serverConfig.port;

async function bootstrap() {
  try {
    // Verificar conexión a base de datos
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida');
    client.release();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Agenda Fácil corriendo en http://localhost:${PORT}`);
      console.log(`📌 Entorno: ${serverConfig.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
    process.exit(1);
  }
}

bootstrap();
