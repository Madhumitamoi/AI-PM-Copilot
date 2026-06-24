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

async function searchSimilar(queryEmbedding, limit = 5) {
  const queryText = `
    SELECT id, source, content, metadata,
      (embedding <#> $1) AS distance
    FROM vectors
    ORDER BY distance
    LIMIT $2
  `;
  const { rows } = await db.query(queryText, [queryEmbedding, limit]);
  return rows;
}

module.exports = { createVectorStore, upsertVector, searchSimilar };
