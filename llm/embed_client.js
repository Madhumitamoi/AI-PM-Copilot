const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const client = new OpenAIApi(configuration);

async function createEmbedding(text) {
  const response = await client.createEmbedding({
    model: 'text-embedding-3-large',
    input: text
  });
  return response.data?.data?.[0]?.embedding || [];
}

module.exports = { createEmbedding };
