// Create missing directories structure
const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const dirs = [
  'middleware',
  'routes',
  'services',
  'utils',
  'controllers',
  'public',
  'tests',
  'scripts',
  'uploads',
  'temp'
];

dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

console.log('Directory structure created successfully!');