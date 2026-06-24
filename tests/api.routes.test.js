const healthHandler = require('../pages/api/health').default;
const prdHandler = require('../pages/api/prd').default;
const vectorsHandler = require('../pages/api/vectors').default;
const insightsHandler = require('../pages/api/insights').default;

jest.mock('../lib/db', () => ({
  query: jest.fn(),
  pool: { end: jest.fn() }
}));

jest.mock('../llm/embed_client', () => ({
  createEmbedding: jest.fn(async (text) => Array(10).fill(0.1))
}));

jest.mock('../lib/vector_store', () => ({
  createVectorStore: jest.fn(async () => {}),
  upsertVector: jest.fn(async () => {}),
  searchSimilar: jest.fn(async () => [{ id: '1', content: 'sample result', distance: 0.1 }])
}));

jest.mock('../llm/llm_client', () => ({
  detectThemes: jest.fn(async (texts) => ({ counts: { Payment: texts.length }, themes: ['PaymentDiscoveryOnboardingNotifications'] }))
}));

const db = require('../lib/db');
const { createEmbedding } = require('../llm/embed_client');
const { createVectorStore, upsertVector, searchSimilar } = require('../lib/vector_store');
const { detectThemes } = require('../llm/llm_client');

function createReq({ method = 'GET', body = undefined, query = {} } = {}) {
  return { method, body, query };
}

function createRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

describe('API route handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('health route should return ok', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] });
    const req = createReq({ method: 'GET' });
    const res = createRes();
    await healthHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
    expect(db.query).toHaveBeenCalledWith('SELECT 1');
  });

  it('prd route should generate a PRD', async () => {
    const req = createReq({
      method: 'POST',
      body: {
        theme: 'PaymentDiscoveryOnboardingNotifications',
        userPain: 'Users cannot complete checkout',
        successMetrics: 'Conversion +2%',
        proposedSolution: 'Revise payment flow and errors',
        experimentPlan: 'A/B test checkout changes'
      }
    });
    const res = createRes();
    await prdHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ title: expect.any(String), problem: expect.any(String) }));
  });

  it('vectors POST should ingest content and upsert a vector', async () => {
    const req = createReq({ method: 'POST', body: { source: 'test', content: 'payment issue', metadata: { tag: 'test' } } });
    const res = createRes();
    await vectorsHandler(req, res);
    expect(createVectorStore).toHaveBeenCalled();
    expect(createEmbedding).toHaveBeenCalledWith('payment issue');
    expect(upsertVector).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
  });

  it('vectors GET should search vectors by query', async () => {
    const req = createReq({ method: 'GET', query: { q: 'payment error' } });
    const res = createRes();
    await vectorsHandler(req, res);
    expect(createEmbedding).toHaveBeenCalledWith('payment error');
    expect(searchSimilar).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ matches: [{ id: '1', content: 'sample result', distance: 0.1 }] });
  });

  it('insights route should map themes and recommend priorities', async () => {
    db.query.mockResolvedValueOnce({ rows: [{ content: 'payment did not work' }] });
    const req = createReq({ method: 'GET' });
    const res = createRes();
    await insightsHandler(req, res);
    expect(detectThemes).toHaveBeenCalledWith(['payment did not work']);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ themes: ['PaymentDiscoveryOnboardingNotifications'] }));
  });
});
