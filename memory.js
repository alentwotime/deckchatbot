const path = require('path');
const Database = require('better-sqlite3');
const config = require('./config');

const dbFile = config.MEM_DB || path.join(__dirname, 'memory.sqlite');
let db;
try {
  db = new Database(dbFile);
} catch (err) {
  if (err.code === 'SQLITE_CANTOPEN') {
    console.error(`Failed to open or create the database file at "${dbFile}". Please check file permissions or the path exists.`);
  } else {
    console.error('Failed to initialize the database:', err.message);
  }
  process.exit(1);
}

db.exec(`
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data TEXT NOT NULL,
  timestamp INTEGER NOT NULL
);`);
/**
 * Adds a measurement to the database.
 * @param {any} data - The measurement data to store (will be stringified as JSON).
 */
function addMeasurement(data) {
  const stmt = db.prepare('INSERT INTO measurements (data, timestamp) VALUES (?, ?)');
  let jsonData;
  try {
    jsonData = JSON.stringify(data);
  } catch (err) {
    console.error('Failed to stringify measurement data:', err);
    return;
  }
  try {
    stmt.run(jsonData, Date.now());
  } catch (err) {
    console.error('Failed to insert measurement:', err);
  }
}

/**
 * Retrieves all measurements from the database.
 * @returns {({id: number, data: any, timestamp: number})[]}
 */
function getAllMeasurements() {
  const stmt = db.prepare('SELECT id, data, timestamp FROM measurements ORDER BY id');
  const rows = stmt.all();
  return rows.map(r => {
    let parsedData;
    try {
      parsedData = JSON.parse(r.data);
    } catch (e) {
      parsedData = null; // or you can set to r.data or handle as needed
      console.warn(`Failed to parse measurement data for id ${r.id}:`, e.message);
    }
    return { id: r.id, data: parsedData, timestamp: r.timestamp };
  });
}

/**
 * Clears all messages and measurements from the database.
 */
function clearMemory() {
  db.exec('DELETE FROM messages;');
  db.exec('DELETE FROM measurements;');
}

/**
 * Retrieves the most recent messages from the database.
 * @param {number} [limit=10] - The maximum number of messages to retrieve.
 * @returns {Array<{id: number, role: string, content: string, timestamp: number}>}
 */
function getRecentMessages(limit = 10) {
  // Ensure limit is a positive integer
  if (typeof limit !== 'number' || !Number.isInteger(limit) || limit <= 0) {
    limit = 10;
  }
  const stmt = db.prepare('SELECT id, role, content, timestamp FROM messages ORDER BY id DESC LIMIT ?');
  return stmt.all(limit).reverse();
}

/**
 * Adds a message to the database.
 * @param {string} role - The role of the message sender.
 * @param {string} content - The message content.
 */
function addMessage(role, content) {
  if (typeof role !== 'string' || typeof content !== 'string' || !role.trim() || !content.trim()) {
    throw new Error('Both role and content must be non-empty strings.');
  }
  const stmt = db.prepare('INSERT INTO messages (role, content, timestamp) VALUES (?, ?, ?)');
  stmt.run(role, content, Date.now());
}

/**
 * Cleans up temporary files created during processing.
 * @param {string} filePath - The path to the temporary file to delete.
 */
function cleanTempFile(filePath) {
  const fs = require('fs');
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Failed to delete temp file ${filePath}:`, err.message);
    }
  });
}

module.exports = {
  addMessage,
  addMeasurement,
  getAllMeasurements,
  clearMemory,
  getRecentMessages,
  cleanTempFile
};
