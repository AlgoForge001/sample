const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Resolve database file path
// Production Docker default: /app/data/notes.db
// Local default: ../data/notes.db relative to server directory
const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/notes.db');
const dbDir = path.dirname(dbPath);

// Ensure the directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable WAL mode for better concurrency and durability
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT DEFAULT '',
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log(`[Database] SQLite connected at: ${dbPath}`);

module.exports = db;

