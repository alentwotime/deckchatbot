// Test startup script to check dependencies
console.log('🔍 Testing project setup...');

const requiredModules = [
  'express',
  'path',
  'cors',
  'helmet',
  'compression',
  'morgan',
  'better-sqlite3',
  'winston',
  'express-validator',
  'multer',
  'express-rate-limit'
];

import fs from 'fs';

console.log('📦 Checking required modules...');
let missingModules = [];

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

requiredModules.forEach(module => {
  try {
    const resolvedPath = require.resolve(module);
    if (
      !resolvedPath.includes(`${require.main.path}\\node_modules\\`) &&
      !resolvedPath.includes(`${require.main.path}/node_modules/`)
    ) {
      throw new Error('Module not found locally');
    }
    console.log(`✅ ${module} - OK`);
  } catch (err) {
    console.log(`❌ ${module} - MISSING`);
    missingModules.push(module);
  }
});

console.log('\n📁 Checking directory structure...');
const requiredDirs = ['middleware', 'routes', 'services', 'utils', 'controllers', 'public', 'logs', 'uploads'];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/ - EXISTS`);
  } else {
    try {
      console.log(`❌ ${dir}/ - MISSING`);
      fs.mkdirSync(dir, { recursive: true });
      console.log(`🔧 Created ${dir}/ directory`);
    } catch (e) {
      console.log(`❌ Failed to create ${dir}/`);
    }
  }
});

console.log('\n📄 Checking required files...');
const requiredFiles = [
  'config.js',
  'middleware/auth.js',
  'middleware/rateLimiter.js',
  'middleware/errorLogger.js',
  'middleware/requestLogger.js',
  'routes/index.js',
  'utils/logger.js',
  'services/openai.service.js'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - EXISTS`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    try {
      const dir = file.substring(0, file.lastIndexOf('/'));
      if (dir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`🔧 Created parent directory: ${dir}/`);
      }
      fs.writeFileSync(file, '');
      console.log(`🔧 Created empty file: ${file}`);
    } catch (err) {
      console.log(`❌ Failed to create ${file}. Please create it manually.`);
    }
  }
});

if (missingModules.length > 0) {
  console.log('\n🚨 Missing modules detected! Run one of the following commands:');
  console.log(`npm install ${missingModules.join(' ')}`);
  console.log(`yarn add ${missingModules.join(' ')}`);
} else {
  console.log('\n🎉 All modules are installed!');
}

console.log('\n🔍 Setup check complete!');