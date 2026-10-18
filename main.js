require('dotenv').config({ quiet: true });

const express = require('express');
const catalogoRoutes = require('./src/routes/catalogo.routes');
const pool = require('./src/config/db');
const reservaRoutes = require('./src/routes/reserva.routes');
const lookupsRoutes = require('./src/routes/lookups.routes');
const { noEncontrado, errorHandler } = require('./src/middlewares/errorHandler');

const app = express();
const puerto = Number(process.env.PORT) || 4000;

app.use(express.json());

// Comprobación de conexión a la base de datos
app.get('/api/db-check', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ estado: 'ok', mensaje: 'Conexión a MySQL exitosa' });
  } catch (error) {
    next(error);
  }
});

// Rutas por recurso
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api', lookupsRoutes);

// 404 y manejo central de errores (siempre al final)
app.use(noEncontrado);
app.use(errorHandler);

app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
