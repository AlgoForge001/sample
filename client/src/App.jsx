import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all notes from REST API
  const fetchNotes = async () => {
    try {
      setError(null);
      const res = await fetch('/api/notes');
      if (!res.ok) {
        throw new Error(`Failed to fetch notes (status: ${res.status})`);
      }
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Could not connect to the server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Handle adding a new note
  const handleAddNote = async (e) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: trimmedContent,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save note');
      }

      const createdNote = await res.json();
      setNotes((prevNotes) => [createdNote, ...prevNotes]);
      setTitle('');
      setContent('');
    } catch (err) {
      console.error('Error adding note:', err);
      setError(err.message || 'Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle deleting a note
  const handleDeleteNote = async (id) => {
    try {
      setDeletingId(id);
      setError(null);
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete note');
      }

      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(err.message || 'Failed to delete note');
    } finally {
      setDeletingId(null);
    }
  };

  // Keyboard shortcut: Ctrl/Cmd + Enter to quickly submit
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleAddNote(e);
    }
  };

  // Format date nicely
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString.replace(' ', 'T') + (dateString.endsWith('Z') ? '' : 'Z'));
      // Fallback if parsed date is invalid
      if (isNaN(d.getTime())) {
        return new Date(dateString).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // Filtered notes based on search query
  const filteredNotes = notes.filter((n) => {
    const q = searchTerm.toLowerCase();
    return (
      (n.title && n.title.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q))
    );
  });

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">📝</div>
          <div>
            <h1 className="brand-title">My Notes</h1>
            <p className="brand-subtitle">Simple, persistent note taking powered by React, Express & SQLite</p>
          </div>
        </div>
      </header>

      {/* Error notification banner */}
      {error && (
        <div className="alert-banner">
          <span>⚠️ {error}</span>
          <button className="btn-retry" onClick={fetchNotes}>
            Retry
          </button>
        </div>
      )}

      {/* Note Creation Form */}
      <section className="card form-card">
        <h2 className="section-heading">Create a Note</h2>
        <form onSubmit={handleAddNote} className="note-form">
          <input
            type="text"
            className="input-title"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
          />
          <textarea
            className="input-content"
            placeholder="Write your note here... (Press Ctrl + Enter to save)"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            required
            disabled={submitting}
          />
          <div className="form-actions">
            <span className="shortcut-hint">Tip: Ctrl + Enter to quickly save</span>
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !content.trim()}
            >
              {submitting ? 'Adding Note...' : 'Add Note'}
            </button>
          </div>
        </form>
      </section>

      {/* Notes Section */}
      <section className="notes-section">
        <div className="notes-header">
          <div className="notes-count-badge">
            <h2>Saved Notes</h2>
            <span className="count-pill">{notes.length}</span>
          </div>

          {notes.length > 2 && (
            <div className="search-box">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="empty-state">
            <div className="spinner"></div>
            <p>Loading your notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📌</div>
            <h3>{searchTerm ? 'No matching notes found' : 'No notes yet'}</h3>
            <p>
              {searchTerm
                ? 'Try searching with a different keyword.'
                : 'Write your first note in the box above and click "Add Note"!'}
            </p>
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map((note) => (
              <article key={note.id} className="note-card">
                <div className="note-body">
                  {note.title && <h3 className="note-title">{note.title}</h3>}
                  <p className="note-content">{note.content}</p>
                </div>
                <div className="note-footer">
                  <time className="note-date">
                    {formatDate(note.created_at)}
                  </time>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => handleDeleteNote(note.id)}
                    disabled={deletingId === note.id}
                    title="Delete note"
                  >
                    {deletingId === note.id ? (
                      'Deleting...'
                    ) : (
                      <>
                        <svg
                          className="trash-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

