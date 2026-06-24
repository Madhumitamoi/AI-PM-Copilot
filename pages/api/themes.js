import db from '../../lib/db';
import { detectThemes } from '../../llm/llm_client';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { rows } = await db.query('SELECT id, content, source, metadata, created_at FROM feedback ORDER BY created_at DESC LIMIT 200');
    const texts = rows.map(r => r.content);
    const themes = await detectThemes(texts);
    return res.status(200).json({ themes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed' });
  }
}
