const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Middlewares
app.use(cors());
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes

// Health Check
app.get('/api/health', (req, res) => {
  try {
    // Verify database connectivity
    db.prepare('SELECT 1').get();
    res.json({
      status: 'ok',
      database: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: err.message
    });
  }
});

// Get all notes (newest first)
app.get('/api/notes', (req, res) => {
  try {
    const notes = db.prepare('SELECT * FROM notes ORDER BY id DESC').all();
    res.json(notes);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Create a new note
app.post('/api/notes', (req, res) => {
  try {
    const { title, content, text } = req.body;
    const noteContent = (content || text || '').trim();
    const noteTitle = (title || '').trim();

    if (!noteContent) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    const insert = db.prepare('INSERT INTO notes (title, content) VALUES (?, ?)');
    const result = insert.run(noteTitle, noteContent);

    const newNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newNote);
  } catch (err) {
    console.error('Error creating note:', err);
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Delete a note
app.delete('/api/notes/:id', (req, res) => {
  try {
    const noteId = req.params.id;
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    const result = stmt.run(noteId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully', id: Number(noteId) });
  } catch (err) {
    console.error('Error deleting note:', err);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Serve frontend build in production
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // Catch-all route to serve index.html for SPA client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // If dist doesn't exist yet (e.g. during standalone backend dev)
  app.get('/', (req, res) => {
    res.send('My Notes API is running. Build the frontend (`npm run build`) to serve the UI.');
  });
}

// Start server bound to 0.0.0.0
app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});

