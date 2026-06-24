const db = require('../lib/db');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  const samples = [
    { source: 'reviews', content: 'I tried to pay but my card was declined and the checkout is confusing' },
    { source: 'support', content: 'Payments failing during contest join, lost money' },
    { source: 'reddit', content: 'Onboarding is terrible — I never saw where to add payment method' },
    { source: 'reviews', content: 'I did not receive notification when my payment failed' },
  ];
  for (const s of samples) {
    await db.query('INSERT INTO feedback(id, source, content) VALUES($1,$2,$3)', [uuidv4(), s.source, s.content]);
  }
  console.log('seeded sample feedback');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
