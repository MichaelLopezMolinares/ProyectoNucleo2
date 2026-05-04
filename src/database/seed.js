/**
 * Script de seed de base de datos
 * Ejecuta los archivos SQL de datos iniciales en orden
 */
const fs = require('fs');
const path = require('path');
const { sequelize } = require('./sequelize');

async function seed() {
  try {
    const seedsDir = path.join(__dirname, 'seeds');
    const files = fs.readdirSync(seedsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`🌱 Ejecutando ${files.length} seeds...`);

    for (const file of files) {
      const sql = fs.readFileSync(path.join(seedsDir, file), 'utf8');
      console.log(`  ▶ ${file}`);
      await sequelize.query(sql); // 🔥 cambio clave
      console.log(`  ✅ ${file} completado`);
    }

    console.log('✅ Todos los seeds ejecutados correctamente');
  } catch (error) {
    console.error('❌ Error en seed:', error.message);
    throw error;
  }
}

seed().catch(() => process.exit(1));