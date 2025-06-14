const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

const dbFile = process.env.MEM_DB || path.join(__dirname, 'memory.sqlite');
const db = new sqlite3.Database(dbFile);

const run = promisify(db.run.bind(db));
const all = promisify(db.all.bind(db));
const exec = promisify(db.exec.bind(db));

db.serialize(() => {
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
);
`);
});

async function addMessage(role, content) {
  await run('INSERT INTO messages (role, content, timestamp) VALUES (?, ?, ?)', [role, content, Date.now()]);
}

async function addMeasurement(data) {
  await run('INSERT INTO measurements (data, timestamp) VALUES (?, ?)', [JSON.stringify(data), Date.now()]);
}

async function logDeckDrawing({ filename, userNotes = null, detectedShape = null, dimensionsJson = null, processedArea = null }) {
  await run(
    'INSERT INTO deck_drawings (filename, user_notes, detected_shape, dimensions_json, processed_area) VALUES (?, ?, ?, ?, ?)',
    [filename, userNotes, detectedShape, dimensionsJson, processedArea]
  );
}

async function logUploadHistory({ fileName, fileType, userId = null }) {
  await run(
    'INSERT INTO upload_history (file_name, file_type, user_id) VALUES (?, ?, ?)',
    [fileName, fileType, userId]
  );
}

async function logAreaCalculation({ drawingId = null, method, inputData, calculatedArea, correctedByUser = null }) {
  await run(
    'INSERT INTO area_calculations (drawing_id, method, input_data, calculated_area, corrected_by_user) VALUES (?, ?, ?, ?, ?)',
    [drawingId, method, JSON.stringify(inputData), calculatedArea, correctedByUser]
  );
}

async function logImprovementFeedback({ areaCalcId, feedbackType, comments = null }) {
  await run(
    'INSERT INTO improvement_feedback (area_calc_id, feedback_type, comments) VALUES (?, ?, ?)',
    [areaCalcId, feedbackType, comments]
  );
}

async function addQuote({ customerName = null, deckArea, material = null, priceEstimate = null }) {
  await run(
    'INSERT INTO quotes (customer_name, deck_area, material, price_estimate) VALUES (?, ?, ?, ?)',
    [customerName, deckArea, material, priceEstimate]
  );
}

async function addMaterialEstimate({ deckId, materialType, sqFtRate, totalCost }) {
  await run(
    'INSERT INTO material_estimates (deck_id, material_type, sq_ft_rate, total_cost) VALUES (?, ?, ?, ?)',
    [deckId, materialType, sqFtRate, totalCost]
  );
}

async function getRecentMessages(limit = 10) {
  const rows = await all('SELECT role, content, timestamp FROM messages ORDER BY id DESC LIMIT ?', [limit]);
  return rows.reverse();
}

async function clearMemory() {
  await exec(`
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
