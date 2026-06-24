-- Simple schema for feedback ingestion and themes
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY,
  source TEXT,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS themes (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS metrics (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value DOUBLE PRECISION,
  updated_at TIMESTAMPTZ DEFAULT now()
);
