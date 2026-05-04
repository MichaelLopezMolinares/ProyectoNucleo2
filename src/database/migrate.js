/**
 * Script de migración de base de datos
 * Ejecuta los archivos SQL de migración en orden
 */
const fs = require('fs');
const path = require('path');
const { sequelize } = require('./sequelize');

async function migrate() {
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📦 Ejecutando ${files.length} migraciones...`);

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`  ▶ ${file}`);
      await sequelize.query(sql); // 🔥 cambio clave
      console.log(`  ✅ ${file} completada`);
    }

    console.log('✅ Todas las migraciones ejecutadas correctamente');
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
    throw error;
  }
}

migrate().catch(() => process.exit(1));