import db from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    await db.query('SELECT 1');
    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
