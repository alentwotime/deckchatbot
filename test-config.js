// Quick config test
require('dotenv').config();

console.log('🔧 Testing configuration...');
console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('API Key:', process.env.API_KEY ? '✅ Set' : '❌ Missing');
console.log('Port:', process.env.PORT || '3000 (default)');
console.log('Node Environment:', process.env.NODE_ENV || 'development (default)');

if (!process.env.OPENAI_API_KEY) {
  console.log('❌ Please set OPENAI_API_KEY in your .env file');
  process.exit(1);
}

console.log('✅ Configuration looks good!');