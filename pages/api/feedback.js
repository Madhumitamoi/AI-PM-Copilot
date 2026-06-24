import { v4 as uuidv4 } from 'uuid';
import db from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { source, content, metadata } = req.body || {};
  if (!content) return res.status(400).json({ error: 'content required' });
  const id = uuidv4();
  try {
    await db.query('INSERT INTO feedback(id, source, content, metadata) VALUES($1,$2,$3,$4)', [id, source || 'unknown', content, metadata || {}]);
    return res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'db error' });
  }
}
