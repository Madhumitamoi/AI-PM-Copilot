import React from 'react';
import Link from 'next/link';
import styles from '../styles/home.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1>Product</h1>
        <p>Aggregate feedback, detect themes, prioritize fixes, and auto-generate PRDs</p>
      </div>

      <section className={styles.features}>
        <div className={styles.featureCard}>
          <h3>🎯 Aggregate Feedback</h3>
          <p>Collect insights from reviews, Reddit, support tickets, and more in one place.</p>
        </div>

        <div className={styles.featureCard}>
          <h3>🔍 Detect Themes</h3>
          <p>AI-powered theme extraction from customer feedback using OpenAI.</p>
        </div>

        <div className={styles.featureCard}>
          <h3>📊 Map to Metrics</h3>
          <p>Connect feedback themes to business metrics and measure impact.</p>
        </div>

        <div className={styles.featureCard}>
          <h3>⚡ Prioritize</h3>
          <p>Get data-driven recommendations for what to fix first.</p>
        </div>

        <div className={styles.featureCard}>
          <h3>📄 Auto-Generate PRDs</h3>
          <p>Generate product requirement documents automatically from insights.</p>
        </div>

        <div className={styles.featureCard}>
          <h3>🔎 Vector Search</h3>
          <p>Semantic search across all feedback using embeddings.</p>
        </div>
      </section>

      <div className={styles.cta}>
        <Link href="/dashboard">
          <a className={styles.button}>Open Dashboard</a>
        </Link>
        <a href="https://github.com/Madhumitamoi/AI-PM-Copilot" className={styles.buttonSecondary}>
          View on GitHub
        </a>
      </div>

      <section className={styles.quickstart}>
        <h2>Quick Start</h2>
        <ol>
          <li>Set up environment variables in <code>.env</code></li>
          <li>Run <code>npm install && npm run migrate && npm run seed</code></li>
          <li>Start with <code>npm run dev</code> or <code>docker-compose up</code></li>
          <li>Open the <Link href="/dashboard"><a>dashboard</a></Link> to explore insights</li>
        </ol>
      </section>
    </main>
  );
}

