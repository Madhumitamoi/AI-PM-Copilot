const OpenAI = require('openai');
const dotenv = require('dotenv');
dotenv.config();

let client = null;
function getClient() {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required for OpenAI calls.');
    }
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

async function createEmbedding(text) {
  const response = await getClient().embeddings.create({
    model: 'text-embedding-3-large',
    input: text
  });
  return response.data?.[0]?.embedding || [];
}

module.exports = { createEmbedding };
