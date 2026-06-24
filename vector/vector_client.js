// Minimal vector store shim — replace with real provider (Pinecone, Weaviate, Milvus)
async function upsert(vectors) {
  console.log('vector upsert stub', vectors.length || 0);
  return { ok: true };
}

async function query(queryVector, options = {}) {
  console.log('vector query stub', options);
  return { matches: [] };
}

module.exports = { upsert, query };
