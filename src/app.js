// Aplicación Express: middlewares globales, rutas de los seis recursos y manejo de errores
const express = require('express');
const cors = require('cors');
const rutas = require('./routes');
const { rutaNoEncontrada, manejarErrores } = require('./middlewares/manejarErrores');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    proyecto: 'Kodo Motors API',
    modulos: [
      '/api/sedes',
      '/api/servicios',
      '/api/catalogo',
      '/api/reservas',
      '/api/repuestos',
      '/api/encuestas',
      '/api/vehiculos',
    ],
    salud: '/api/salud',
  });
});

app.use('/api', rutas);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

module.exports = app;
