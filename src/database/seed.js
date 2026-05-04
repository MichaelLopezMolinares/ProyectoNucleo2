/**
 * Script de seed de base de datos
 * Ejecuta los archivos SQL de datos iniciales en orden
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('./pool');

async function seed() {
  const client = await pool.connect();
  try {
    const seedsDir = path.join(__dirname, 'seeds');
    const files = fs.readdirSync(seedsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`🌱 Ejecutando ${files.length} seeds...`);

    for (const file of files) {
      const sql = fs.readFileSync(path.join(seedsDir, file), 'utf8');
      console.log(`  ▶ ${file}`);
      await client.query(sql);
      console.log(`  ✅ ${file} completado`);
    }

    console.log('✅ Todos los seeds ejecutados correctamente');
  } catch (error) {
    console.error('❌ Error en seed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
