# AI Product Manager Copilot

An AI-powered platform that aggregates customer feedback (reviews, Reddit, support tickets), detects themes, maps them to business metrics, prioritizes fixes, and auto-generates product requirement documents (PRDs).

**Tech Stack:** Next.js, Node.js, Postgres, OpenAI, Jest, Vector Search (pgvector)

## Table of Contents

1. [Quick Start](#quick-start)
2. [Environment Setup](#environment-setup)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Testing](#testing)
6. [OpenAI Integration](#openai-integration)
7. [Vector Store](#vector-store)
8. [Deployment](#deployment)

## Quick Start

### Prerequisites

- Node.js 16+
- Postgres 13+ (with `pgvector` extension for vector similarity search)
- OpenAI API key (for theme extraction and embeddings)

### Installation Steps

1. **Clone the repository:**

```bash
git clone https://github.com/Madhumitamoi/AI-PM-Copilot.git
cd AI-PM-Copilot
```

2. **Copy environment variables:**

```bash
cp .env.example .env
```

3. **Update `.env` with your configuration:**

```bash
DATABASE_URL=postgres://postgres:password@localhost:5432/engine_db
OPENAI_API_KEY=sk-your-openai-key-here
PORT=3000
```

4. **Install dependencies:**

```bash
npm install
```

5. **Create database and run migrations:**

```bash
createdb engine_db
psql engine_db -c "CREATE EXTENSION IF NOT EXISTS pgvector"
npm run migrate
npm run seed
```

6. **Start the development server:**

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Environment Setup

Required environment variables (see `.env.example`):

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Postgres connection string | `postgres://user:pass@localhost:5432/engine_db` |
| `OPENAI_API_KEY` | OpenAI API key for theme extraction | `sk-...` |
| `PORT` | Dev server port | `3000` |

## Database Schema

The app uses three main tables:

### `feedback` table
Stores user feedback from various sources.

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY,
  source TEXT,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `themes` table
Stores detected product themes.

```sql
CREATE TABLE themes (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### `metrics` table
Stores business metrics for impact tracking.

```sql
CREATE TABLE metrics (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value DOUBLE PRECISION,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `vectors` table
Stores feedback embeddings for semantic search.

```sql
CREATE TABLE vectors (
  id UUID PRIMARY KEY,
  source TEXT,
  content TEXT,
  embedding DOUBLE PRECISION[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## API Endpoints

### 1. Ingest Feedback

**Endpoint:** `POST /api/feedback`

**Request:**
```bash
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "source": "reddit",
    "content": "I tried to pay but checkout is broken",
    "metadata": {"post_id": "abc123"}
  }'
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 2. Detect Themes

**Endpoint:** `GET /api/themes`

**Request:**
```bash
curl http://localhost:3000/api/themes
```

**Response:**
```json
{
  "themes": ["PaymentDiscoveryOnboardingNotifications", "Onboarding"],
  "counts": {
    "Payment": 5,
    "Onboarding": 2
  }
}
```

### 3. Get Insights (Themes + Metrics Mapping + Recommendations)

**Endpoint:** `GET /api/insights`

**Request:**
```bash
curl http://localhost:3000/api/insights
```

**Response:**
```json
{
  "themes": ["PaymentDiscoveryOnboardingNotifications"],
  "counts": {"Payment": 5},
  "mappings": [
    {
      "theme": "Payment",
      "metric": "payment_complaints",
      "impact": -5
    }
  ],
  "recommendations": [
    {
      "theme": "Payment",
      "recommendation": "Fix payment flow first",
      "expectedImpact": 5.5
    }
  ]
}
```

### 4. Generate PRD

**Endpoint:** `POST /api/prd`

**Request:**
```bash
curl -X POST http://localhost:3000/api/prd \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "PaymentDiscoveryOnboardingNotifications",
    "userPain": "Users cannot complete checkout",
    "successMetrics": "Conversion +2%",
    "proposedSolution": "Simplify payment form and add error clarity",
    "experimentPlan": "A/B test checkout redesign"
  }'
```

**Response:**
```json
{
  "title": "PaymentDiscoveryOnboardingNotifications — PRD (auto-generated)",
  "problem": "PaymentDiscoveryOnboardingNotifications: Users cannot complete checkout",
  "successMetrics": "Conversion +2%",
  "proposedSolution": "Simplify payment form and add error clarity",
  "experimentPlan": "A/B test checkout redesign",
  "generatedAt": "2026-06-24T10:30:45.123Z"
}
```

### 5. Vector Ingestion & Search

**Ingest:** `POST /api/vectors`
```bash
curl -X POST http://localhost:3000/api/vectors \
  -H "Content-Type: application/json" \
  -d '{
    "source": "support_ticket",
    "content": "Payment failed during checkout",
    "metadata": {"ticket_id": "T123"}
  }'
```

**Search:** `GET /api/vectors?q=payment%20error`
```bash
curl "http://localhost:3000/api/vectors?q=payment%20error"
```

### 6. Health Check

**Endpoint:** `GET /api/health`

```bash
curl http://localhost:3000/api/health
```

## Testing

### Unit & Route Tests

Run all tests:
```bash
npm test
```

Watch mode:
```bash
npm test -- --watch
```

### Integration Tests

Run integration tests (requires `OPENAI_API_KEY` and Postgres):

```bash
OPENAI_API_KEY=sk-your-key DATABASE_URL=postgres://... npm run test:integration
```

Integration tests verify:
- Real OpenAI API theme extraction
- Embeddings creation
- Vector persistence and search

## OpenAI Integration

The app uses OpenAI for two purposes:

1. **Theme Extraction** (`llm/openai_client.js`):
   - Sends feedback texts to `gpt-4o-mini`
   - Extracts up to 5 themes in PascalCase
   - Falls back to keyword-based heuristics if OpenAI fails

2. **Embeddings** (`llm/embed_client.js`):
   - Uses `text-embedding-3-large` model
   - Stores embeddings in Postgres
   - Enables semantic search

To use real OpenAI:
```bash
export OPENAI_API_KEY=sk-...
npm run dev
```

## Vector Store

The app uses a **Postgres-based vector store** with the `pgvector` extension:

- Vectors are stored as `DOUBLE PRECISION[]` arrays
- Semantic search uses cosine distance similarity
- Fallback JavaScript implementation available if pgvector not installed

Example query:
```bash
curl "http://localhost:3000/api/vectors?q=how%20do%20I%20reset%20my%20password"
```

## Deployment

### Production Build

```bash
npm run build
npm run start
```

### Docker (optional)

See `Dockerfile` (coming next) for containerized deployment.

### Environment Variables for Production

- Set all `.env` variables securely (e.g., AWS Secrets Manager, HashiCorp Vault)
- Ensure `DATABASE_URL` points to a production Postgres instance
- Use environment-specific OpenAI keys if needed

### Scaling Considerations

- Use a connection pool for Postgres (default: 10 clients)
- Consider background workers for heavy LLM processing
- Cache theme extraction results to reduce API calls
- Monitor vector search latency for large feedback volumes

## Project Structure

```
.
├── pages/
│   ├── index.js          # Home page
│   └── api/              # API routes
│       ├── feedback.js    # Feedback ingestion
│       ├── themes.js      # Theme detection
│       ├── insights.js    # Metrics mapping + recommendations
│       ├── prd.js         # PRD generation
│       ├── vectors.js     # Vector ingestion & search
│       └── health.js      # Health check
├── llm/                  # LLM integrations
│   ├── openai_client.js
│   └── embed_client.js
├── lib/                  # Utilities
│   ├── db.js             # Postgres client
│   └── vector_store.js   # Vector operations
├── insights/             # Business logic
│   └── engine.js         # Metrics mapping & prioritization
├── prd/                  # PRD generation
│   └── generator.js      # Auto-generate PRD
├── migrations/           # Database schema
│   └── 001_init.sql
├── scripts/              # Utilities
│   └── seed.js           # Sample data
└── tests/                # Test suite
    ├── api.routes.test.js
    └── integration.test.js
```

## Contributing

1. Create a feature branch
2. Make changes and add tests
3. Run `npm test` to verify
4. Push and create a pull request

## License

MIT
