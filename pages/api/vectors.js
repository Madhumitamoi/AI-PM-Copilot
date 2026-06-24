import { v4 as uuidv4 } from 'uuid';
import { createEmbedding } from '../../llm/embed_client';
import { createVectorStore, upsertVector, searchSimilar } from '../../lib/vector_store';
import db from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { source, content, metadata } = req.body || {};
    if (!content) return res.status(400).json({ error: 'content required' });
    try {
      await createVectorStore();
      const embedding = await createEmbedding(content);
      const id = uuidv4();
      await upsertVector({ id, source: source || 'feedback', content, embedding, metadata });
      return res.status(201).json({ id, ok: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'vector ingest failed' });
    }
  }

  if (req.method === 'GET') {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'query required' });
    try {
      const embedding = await createEmbedding(q);
      const matches = await searchSimilar(embedding, 5);
      return res.status(200).json({ matches });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'vector search failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
