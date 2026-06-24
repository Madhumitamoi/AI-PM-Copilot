// Insights engine: map themes to metrics and recommend priorities
function mapThemesToMetrics(themeCounts) {
  // Basic mapping rules
  const mappings = [];
  if (themeCounts['Payment'] > 0) mappings.push({ theme: 'Payment', metric: 'payment_complaints', impact: -1 * themeCounts['Payment'] });
  if (themeCounts['Onboarding'] > 0) mappings.push({ theme: 'Onboarding', metric: 'contest_join_rate', impact: -0.5 * themeCounts['Onboarding'] });
  if (themeCounts['Notifications'] > 0) mappings.push({ theme: 'Notifications', metric: 'engagement', impact: -0.2 * themeCounts['Notifications'] });
  return mappings;
}

function recommendPriorities(mappings) {
  // Score and sort
  const scored = mappings.map(m => ({ ...m, score: Math.abs(m.impact) }));
  scored.sort((a,b) => b.score - a.score);
  // produce a concise recommendation
  const recommendations = scored.map(s => ({ theme: s.theme, recommendation: `Fix ${s.theme.toLowerCase()} flow first`, expectedImpact: +(s.score * 1.1).toFixed(2) }));
  return recommendations;
}

module.exports = { mapThemesToMetrics, recommendPriorities };
