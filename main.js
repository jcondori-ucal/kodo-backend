require('dotenv').config({ quiet: true });

const express = require('express');

const app = express();
const puerto = Number(process.env.PORT) || 4000;

app.use(express.json());

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
