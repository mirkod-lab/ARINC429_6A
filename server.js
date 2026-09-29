require('dotenv').config();

const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function parseId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function validateDescription(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const descripcion = value.trim();
  if (!descripcion || descripcion.length > 50) {
    return null;
  }

  return descripcion;
}

app.get('/api/instrumentos', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT ins_id, ins_descripcion FROM instrumentos ORDER BY ins_id'
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.get('/api/instrumentos/:id', async (req, res, next) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'El identificador no es válido.' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT ins_id, ins_descripcion FROM instrumentos WHERE ins_id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Instrumento no encontrado.' });
    }
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.post('/api/instrumentos', async (req, res, next) => {
  const descripcion = validateDescription(req.body?.ins_descripcion);
  if (descripcion === null) {
    return res.status(400).json({
      error: 'La descripción debe contener entre 1 y 50 caracteres.'
    });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO instrumentos (ins_descripcion) VALUES (?)',
      [descripcion]
    );
    res.status(201).json({
      ins_id: result.insertId,
      ins_descripcion: descripcion
    });
  } catch (error) {
    next(error);
  }
});

app.put('/api/instrumentos/:id', async (req, res, next) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'El identificador no es válido.' });
  }

  const descripcion = validateDescription(req.body?.ins_descripcion);
  if (descripcion === null) {
    return res.status(400).json({
      error: 'La descripción debe contener entre 1 y 50 caracteres.'
    });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE instrumentos SET ins_descripcion = ? WHERE ins_id = ?',
      [descripcion, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Instrumento no encontrado.' });
    }
    res.json({ ins_id: id, ins_descripcion: descripcion });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/instrumentos/:id', async (req, res, next) => {
  const id = parseId(req.params.id);
  if (!id) {
    return res.status(400).json({ error: 'El identificador no es válido.' });
  }

  try {
    const [result] = await pool.execute(
      'DELETE FROM instrumentos WHERE ins_id = ?',
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Instrumento no encontrado.' });
    }
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) {
    return next(error);
  }
  res.status(500).json({
    error: 'Error del servidor o de conexión con MySQL. Revisa la configuración.'
  });
});

app.listen(port, () => {
  console.log(`Servidor disponible en http://localhost:${port}`);
});
