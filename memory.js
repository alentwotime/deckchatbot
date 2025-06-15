const path = require('path');
const Database = require('better-sqlite3');

const dbFile = process.env.MEM_DB || path.join(__dirname, 'memory.sqlite');
const db = new Database(dbFile);

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

function addMessage(role, content) {
  const stmt = db.prepare('INSERT INTO messages (role, content, timestamp) VALUES (?, ?, ?)');
  stmt.run(role, content, Date.now());
}

function addMeasurement(data) {
  const stmt = db.prepare('INSERT INTO measurements (data, timestamp) VALUES (?, ?)');
  stmt.run(JSON.stringify(data), Date.now());
}

function getAllMeasurements() {
  const stmt = db.prepare('SELECT id, data, timestamp FROM measurements ORDER BY id');
  const rows = stmt.all();
  return rows.map(r => ({ id: r.id, data: JSON.parse(r.data), timestamp: r.timestamp }));
}

function getRecentMessages(limit = 10) {
  const stmt = db.prepare('SELECT role, content, timestamp FROM messages ORDER BY id DESC LIMIT ?');
  const rows = stmt.all(limit);
  return rows.reverse();
}

function clearMemory() {
  db.exec('DELETE FROM messages; DELETE FROM measurements;');
}

module.exports = {
  addMessage,
  addMeasurement,
  getRecentMessages,
  getAllMeasurements,
  clearMemory
};
