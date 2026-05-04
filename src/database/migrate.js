/**
 * Script de migración de base de datos
 * Ejecuta los archivos SQL de migración en orden
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function migrate() {
  const client = await pool.connect();
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📦 Ejecutando ${files.length} migraciones...`);

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`  ▶ ${file}`);
      await client.query(sql);
      console.log(`  ✅ ${file} completada`);
    }

    console.log('✅ Todas las migraciones ejecutadas correctamente');
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));
