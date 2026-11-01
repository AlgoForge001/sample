const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Resolve database file path
// Production default in Docker/Coolify: /app/data/notes.db
// Local dev default: ../data/notes.db
const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/notes.db');
const dbDir = path.dirname(dbPath);

// Ensure the target directory exists
try {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
} catch (err) {
  console.error(`[Database] Failed to create database directory at ${dbDir}:`, err.message);
}

let db;
try {
  db = new Database(dbPath);

  // Enable WAL (Write-Ahead Logging) mode for improved concurrency and durability
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
} catch (err) {
  console.error(`[Database Error] Failed to initialize SQLite database at ${dbPath}:`, err.message);
  throw err;
}

module.exports = db;
