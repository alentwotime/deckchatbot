const fs = require('fs');
const path = require('path');
const memory = require('../memory');

const data = memory.getAllMeasurements();
const outPath = path.join(__dirname, '..', 'measurement_backup.json');
fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
console.log(`Backup written to ${outPath}`);
