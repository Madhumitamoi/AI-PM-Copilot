import React, { useEffect, useState } from 'react';
import styles from '../styles/dashboard.module.css';

export default function Dashboard() {
  const [insights, setInsights] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insightsRes, feedbackRes] = await Promise.all([
          fetch('/api/insights'),
          fetch('/api/feedback').catch(() => ({ json: () => ({ ok: false }) }))
        ]);
        
        const insightsData = await insightsRes.json();
        setInsights(insightsData);

        const feedbackData = await feedbackRes.json();
        if (feedbackData.items) {
          setFeedback(feedbackData.items);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className={styles.container}><p>Loading...</p></div>;
  if (error) return <div className={styles.container}><p>Error: {error}</p></div>;

  return (
    <div className={styles.container}>
      <h1>AI Product Manager Copilot</h1>
      
      {insights && (
        <>
          <section className={styles.section}>
            <h2>Detected Themes</h2>
            <div className={styles.themeGrid}>
              {insights.themes && insights.themes.map((theme, idx) => (
                <div key={idx} className={styles.themeCard}>
                  <h3>{theme}</h3>
                  <p className={styles.count}>{insights.counts?.[theme] || 0} mentions</p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Metrics Impact</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Theme</th>
                  <th>Metric</th>
                  <th>Estimated Impact</th>
                </tr>
              </thead>
              <tbody>
                {insights.mappings && insights.mappings.map((mapping, idx) => (
                  <tr key={idx}>
                    <td>{mapping.theme}</td>
                    <td>{mapping.metric}</td>
                    <td className={mapping.impact < 0 ? styles.negative : styles.positive}>
                      {mapping.impact}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className={styles.section}>
            <h2>Prioritized Recommendations</h2>
            <div className={styles.recommendationList}>
              {insights.recommendations && insights.recommendations.map((rec, idx) => (
                <div key={idx} className={styles.recommendationCard}>
                  <h3>{rec.theme}</h3>
                  <p>{rec.recommendation}</p>
                  <p className={styles.impact}>Expected impact: <strong>+{rec.expectedImpact}%</strong></p>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <section className={styles.section}>
        <h2>Recent Feedback</h2>
        {feedback.length > 0 ? (
          <div className={styles.feedbackList}>
            {feedback.slice(0, 5).map((item, idx) => (
              <div key={idx} className={styles.feedbackCard}>
                <p className={styles.source}>{item.source}</p>
                <p>{item.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No feedback data available</p>
        )}
      </section>
    </div>
  );
}
