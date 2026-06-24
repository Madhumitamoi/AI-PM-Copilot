# AI Product Manager Copilot (scaffold)

Minimal scaffold for the AI Product Manager Copilot — Next.js frontend, API routes, Postgres schema, simple LLM/vector stubs, insight engine, and PRD generator.

Quick start

1. Copy `.env.example` to `.env` and update `DATABASE_URL` and keys.

2. Install dependencies:

```bash
npm install
```

3. Create the database and run migrations:

```bash
export DATABASE_URL="postgres://user:pass@localhost:5432/engine_db"
npm run migrate
npm run seed
```

4. Start dev server:

```bash
npm run dev
```

API endpoints

- `POST /api/feedback` — ingest feedback JSON `{ source, content, metadata }`
- `GET /api/themes` — detect themes from recent feedback
- `GET /api/insights` — product themes, metric mappings, and prioritization recommendations
- `POST /api/prd` — generate PRD JSON from a theme and product hypothesis

OpenAI integration

- Set `OPENAI_API_KEY` in `.env`
- Theme detection uses `llm/openai_client.js` to extract product themes

Vector store pattern

- `lib/vector_store.js` shows a Postgres-based vector storage design
- Requires the `pgvector` extension for the nearest-neighbor operator in Postgres

Next steps

- Add real vector ingestion and search flows
- Add authentication and background workers for heavy processing
