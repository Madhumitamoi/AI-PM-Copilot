import { generatePRD } from '../../prd/generator';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { theme, userPain, successMetrics, proposedSolution, experimentPlan } = req.body || {};
  if (!theme || !userPain || !successMetrics || !proposedSolution || !experimentPlan) {
    return res.status(400).json({ error: 'Missing required PRD fields' });
  }
  const prd = generatePRD({ theme, userPain, successMetrics, proposedSolution, experimentPlan });
  return res.status(201).json(prd);
}
