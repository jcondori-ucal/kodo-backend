const express = require('express');
const cors = require('cors');
const rutas = require('./routes');
const { rutaNoEncontrada, manejarErrores } = require('./middlewares/manejarErrores');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    ok: true,
    proyecto: 'Kodo Motors API',
    modulos: ['/api/servicios', '/api/sedes'],
    salud: '/api/salud',
  });
});

app.use('/api', rutas);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

module.exports = app;
