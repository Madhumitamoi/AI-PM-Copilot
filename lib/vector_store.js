const db = require('./db');

async function createVectorStore() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS vectors (
      id UUID PRIMARY KEY,
      source TEXT,
      content TEXT,
      embedding DOUBLE PRECISION[],
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `);
}

async function upsertVector({ id, source, content, embedding, metadata }) {
  await db.query(
    `INSERT INTO vectors(id, source, content, embedding, metadata) VALUES($1,$2,$3,$4,$5)
      ON CONFLICT (id) DO UPDATE SET source = EXCLUDED.source, content = EXCLUDED.content, embedding = EXCLUDED.embedding, metadata = EXCLUDED.metadata`,
    [id, source, content, embedding, metadata || {}]
  );
}

function cosineDistance(vecA = [], vecB = []) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length || vecA.length === 0) {
    return Infinity;
  }
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < vecA.length; i += 1) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  if (magA === 0 || magB === 0) return Infinity;
  const similarity = dot / (Math.sqrt(magA) * Math.sqrt(magB));
  return 1 - similarity;
}

async function searchSimilar(queryEmbedding, limit = 5) {
  try {
    const queryText = `
      SELECT id, source, content, metadata,
        (embedding <#> $1) AS distance
      FROM vectors
      ORDER BY distance
      LIMIT $2
    `;
    const { rows } = await db.query(queryText, [queryEmbedding, limit]);
    return rows;
  } catch (error) {
    console.warn('pgvector search failed; using JS fallback', error.message || error);
    const { rows } = await db.query('SELECT id, source, content, metadata, embedding FROM vectors');
    const scored = rows
      .map(row => ({ ...row, distance: cosineDistance(queryEmbedding, row.embedding) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
    return scored;
  }
}

module.exports = { createVectorStore, upsertVector, searchSimilar };
