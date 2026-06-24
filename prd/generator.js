function generatePRD({ theme, userPain, successMetrics, proposedSolution, experimentPlan }) {
  return {
    title: `${theme} — PRD (auto-generated)`,
    problem: `${theme}: ${userPain}`,
    successMetrics,
    proposedSolution,
    experimentPlan,
    generatedAt: new Date().toISOString()
  };
}

module.exports = { generatePRD };
