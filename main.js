require('dotenv').config({ quiet: true });

const express = require('express');
const catalogoRoutes = require('./src/routes/catalogo.routes');

const app = express();
const puerto = Number(process.env.PORT) || 4000;

app.use(express.json());

app.use('/api/catalogo', catalogoRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
