const OpenAI = require('openai');
const config = require('../config');

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

async function askChat(messages) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages
  });
  return res.choices[0].message.content;
}

module.exports = { askChat };

