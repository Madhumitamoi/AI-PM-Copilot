const { execSync } = require('child_process');

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/engine_integration';

const db = require('../lib/db');
const { createVectorStore, upsertVector, searchSimilar } = require('../lib/vector_store');

const openAiKey = process.env.OPENAI_API_KEY;
const hasOpenAiKey = Boolean(openAiKey);
let createEmbedding;
let generateThemes;

if (hasOpenAiKey) {
  ({ createEmbedding } = require('../llm/embed_client'));
  ({ generateThemes } = require('../llm/openai_client'));
}

beforeAll(async () => {
  if (!hasOpenAiKey) {
    console.warn('Skipping OpenAI integration tests because OPENAI_API_KEY is not set.');
    return;
  }
  execSync(`psql "${process.env.DATABASE_URL}" -c "SELECT 1"`, { shell: true });
  await db.query('CREATE EXTENSION IF NOT EXISTS pgvector');
  await db.query(`CREATE TABLE IF NOT EXISTS feedback (id UUID PRIMARY KEY, source TEXT, content TEXT NOT NULL, metadata JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now())`);
  await db.query(`CREATE TABLE IF NOT EXISTS vectors (id UUID PRIMARY KEY, source TEXT, content TEXT, embedding DOUBLE PRECISION[], metadata JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now())`);
});

afterAll(async () => {
  if (!hasOpenAiKey) {
    return;
  }
  await db.query('DROP TABLE IF EXISTS vectors');
  await db.query('DROP TABLE IF EXISTS feedback');
  await db.pool.end();
});

describe('integration suite', () => {
  beforeAll(() => {
    if (!hasOpenAiKey) {
      console.warn('Skipping OpenAI integration tests because OPENAI_API_KEY is not set.');
    }
  });

  it('creates an embedding for text', async () => {
    if (!hasOpenAiKey) return;
    const vector = await createEmbedding('test payment flow issue');
    expect(Array.isArray(vector)).toBe(true);
    expect(vector.length).toBeGreaterThan(0);
  });

  it('extracts themes from real OpenAI output', async () => {
    if (!hasOpenAiKey) return;
    const feedbacks = ['My payment failed during checkout', 'I did not get an email notification', 'Sign-up was confusing and I could not find payment settings'];
    const result = await generateThemes(feedbacks);
    expect(result).toHaveProperty('themes');
    expect(Array.isArray(result.themes)).toBe(true);
  });

  it('persists and searches vectors', async () => {
    if (!hasOpenAiKey) {
      return;
    }
    await createVectorStore();
    const embedding = await createEmbedding('payment issue');
    await upsertVector({ id: '11111111-1111-1111-1111-111111111111', source: 'test', content: 'payment issue', embedding, metadata: { tag: 'integration' } });
    const matches = await searchSimilar(embedding, 3);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]).toHaveProperty('content', 'payment issue');
  });
});
