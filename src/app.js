const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/database');
const { errorHandler } = require('./core/middlewares/errorHandler');
const { requestLogger } = require('./core/middlewares/requestLogger');
const routes = require('./routes');

dotenv.config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Rutas
app.use('/api/v1', routes);

// Manejo centralizado de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Agenda Fácil backend corriendo en puerto ${PORT}`);
  });
};

start();

module.exports = app;
