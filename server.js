const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir la página web estática (index.html)
app.use(express.static(path.join(__dirname)));

// Endpoint especial para recibir los pings cada 5 minutos
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor activo y escuchando en el puerto ${PORT}`);
});
