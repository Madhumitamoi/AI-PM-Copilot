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

- `POST /api/feedback` — ingest feedback JSON { source, content, metadata }
- `GET /api/themes` — detect themes (stub)

Next steps

- Hook real LLM and vector search providers in `llm/` and `vector/`
- Add authentication and background workers for heavy processing
