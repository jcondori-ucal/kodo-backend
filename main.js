require('dotenv').config({ quiet: true });

const express = require('express');
const pool = require('./src/config/db');

const app = express();
const puerto = Number(process.env.PORT) || 4000;

app.use(express.json());

app.get('/api/db-check', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ estado: 'ok', mensaje: 'Conexión a MySQL exitosa' });
  } catch (error) {
    res.status(500).json({ estado: 'error', codigo: error.code });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
