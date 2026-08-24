const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'notes.json');

// Middleware para parsear JSON en las peticiones
app.use(express.json());

// Servir la página web estática (index.html)
app.use(express.static(path.join(__dirname)));

// Utilidades para leer y escribir notas en el archivo notes.json
function readNotesFromFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return content ? JSON.parse(content) : [];
  } catch (err) {
    console.error('Error al leer notes.json:', err);
    return [];
  }
}

function writeNotesToFile(notes) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(notes, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error al escribir en notes.json:', err);
    return false;
  }
}

// --- Endpoints de la API para sincronizar notas entre todas las PCs ---

// 1. Obtener todas las notas
app.get('/api/notes', (req, res) => {
  const notes = readNotesFromFile();
  res.json(notes);
});

// 2. Crear una nueva nota
app.post('/api/notes', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Título y contenido son requeridos' });
  }

  const notes = readNotesFromFile();
  const newNote = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    title: title.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  notes.unshift(newNote);
  writeNotesToFile(notes);
  res.status(201).json(newNote);
});

// 3. Editar una nota existente
app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  let notes = readNotesFromFile();
  const index = notes.findIndex(n => n.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Nota no encontrada' });
  }

  notes[index] = {
    ...notes[index],
    title: title !== undefined ? title.trim() : notes[index].title,
    content: content !== undefined ? content.trim() : notes[index].content,
    updatedAt: new Date().toISOString()
  };

  writeNotesToFile(notes);
  res.json(notes[index]);
});

// 4. Eliminar una nota
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  let notes = readNotesFromFile();
  const initialLength = notes.length;
  notes = notes.filter(n => n.id !== id);

  if (notes.length === initialLength) {
    return res.status(404).json({ error: 'Nota no encontrada' });
  }

  writeNotesToFile(notes);
  res.json({ success: true, message: 'Nota eliminada' });
});

// Endpoint especial para recibir los pings cada 5 minutos
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor activo y escuchando en el puerto ${PORT}`);
});
