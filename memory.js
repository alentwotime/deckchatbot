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
);
-- Additional tables for storing deck drawings and related data
CREATE TABLE IF NOT EXISTS deck_drawings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename TEXT NOT NULL,
  upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_notes TEXT,
  detected_shape TEXT,
  dimensions_json TEXT,
  processed_area REAL
);
CREATE TABLE IF NOT EXISTS upload_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT
);
CREATE TABLE IF NOT EXISTS area_calculations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  drawing_id INTEGER,
  method TEXT NOT NULL,
  input_data TEXT NOT NULL,
  calculated_area REAL NOT NULL,
  corrected_by_user REAL,
  FOREIGN KEY (drawing_id) REFERENCES deck_drawings(id)
);
CREATE TABLE IF NOT EXISTS improvement_feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  area_calc_id INTEGER,
  feedback_type TEXT NOT NULL,
  comments TEXT,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (area_calc_id) REFERENCES area_calculations(id)
);
CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT,
  deck_area REAL NOT NULL,
  material TEXT,
  price_estimate REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS material_estimates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deck_id INTEGER,
  material_type TEXT,
  sq_ft_rate REAL,
  total_cost REAL,
  FOREIGN KEY (deck_id) REFERENCES deck_drawings(id)
);`);

function addMessage(role, content) {
  const stmt = db.prepare('INSERT INTO messages (role, content, timestamp) VALUES (?, ?, ?)');
  stmt.run(role, content, Date.now());
}

function addMeasurement(data) {
  const stmt = db.prepare('INSERT INTO measurements (data, timestamp) VALUES (?, ?)');
  stmt.run(JSON.stringify(data), Date.now());
}

function logDeckDrawing({ filename, userNotes = null, detectedShape = null, dimensionsJson = null, processedArea = null }) {
  const stmt = db.prepare(
    'INSERT INTO deck_drawings (filename, user_notes, detected_shape, dimensions_json, processed_area) VALUES (?, ?, ?, ?, ?)'
  );
  stmt.run(filename, userNotes, detectedShape, dimensionsJson, processedArea);
}

function logUploadHistory({ fileName, fileType, userId = null }) {
  const stmt = db.prepare(
    'INSERT INTO upload_history (file_name, file_type, user_id) VALUES (?, ?, ?)'
  );
  stmt.run(fileName, fileType, userId);
}

function logAreaCalculation({ drawingId = null, method, inputData, calculatedArea, correctedByUser = null }) {
  const stmt = db.prepare(
    'INSERT INTO area_calculations (drawing_id, method, input_data, calculated_area, corrected_by_user) VALUES (?, ?, ?, ?, ?)'
  );
  stmt.run(drawingId, method, JSON.stringify(inputData), calculatedArea, correctedByUser);
}

function logImprovementFeedback({ areaCalcId, feedbackType, comments = null }) {
  const stmt = db.prepare(
    'INSERT INTO improvement_feedback (area_calc_id, feedback_type, comments) VALUES (?, ?, ?)'
  );
  stmt.run(areaCalcId, feedbackType, comments);
}

function addQuote({ customerName = null, deckArea, material = null, priceEstimate = null }) {
  const stmt = db.prepare(
    'INSERT INTO quotes (customer_name, deck_area, material, price_estimate) VALUES (?, ?, ?, ?)'
  );
  stmt.run(customerName, deckArea, material, priceEstimate);
}

function addMaterialEstimate({ deckId, materialType, sqFtRate, totalCost }) {
  const stmt = db.prepare(
    'INSERT INTO material_estimates (deck_id, material_type, sq_ft_rate, total_cost) VALUES (?, ?, ?, ?)'
  );
  stmt.run(deckId, materialType, sqFtRate, totalCost);
}

function getRecentMessages(limit = 10) {
  const stmt = db.prepare('SELECT role, content, timestamp FROM messages ORDER BY id DESC LIMIT ?');
  const rows = stmt.all(limit);
  return rows.reverse();
}

function clearMemory() {
  db.exec(`
    DELETE FROM messages;
    DELETE FROM measurements;
    DELETE FROM deck_drawings;
    DELETE FROM upload_history;
    DELETE FROM area_calculations;
    DELETE FROM improvement_feedback;
    DELETE FROM quotes;
    DELETE FROM material_estimates;
  `);
}

module.exports = {
  addMessage,
  addMeasurement,
  logDeckDrawing,
  logUploadHistory,
  logAreaCalculation,
  logImprovementFeedback,
  addQuote,
  addMaterialEstimate,
  getRecentMessages,
  clearMemory,
  db
};
