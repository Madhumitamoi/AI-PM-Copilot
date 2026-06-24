import db from '../../lib/db';
import { detectThemes } from '../../llm/llm_client';
import { mapThemesToMetrics, recommendPriorities } from '../../insights/engine';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { rows } = await db.query('SELECT content FROM feedback ORDER BY created_at DESC LIMIT 200');
    const texts = rows.map(r => r.content);
    const { counts, themes } = await detectThemes(texts);
    const mappings = mapThemesToMetrics(counts);
    const recommendations = recommendPriorities(mappings);
    return res.status(200).json({ themes, counts, mappings, recommendations });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'failed' });
  }
}
