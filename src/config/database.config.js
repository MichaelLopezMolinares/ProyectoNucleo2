const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  'postgresql://postgres.fgjxavwyjwkdscqgjmcp:YytFMRHKuM0wKB4s@aws-1-us-west-2.pooler.supabase.com:6543/postgres',
  {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

async function test() {
  try {
    await sequelize.authenticate();
    console.log('DB conectada correctamente 🔥');
  } catch (error) {
    console.error('Error de conexión:', error);
  }
}

module.exports = { sequelize, test };