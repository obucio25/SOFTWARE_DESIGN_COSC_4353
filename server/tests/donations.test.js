const request = require('supertest');
const express = require('express');
jest.mock('../middleware/auth', () => jest.fn((req, res, next) => { req.user = { id_user: 1, role: 'manager' }; next(); }));
jest.mock('../db', () => ({ query: jest.fn() }));
const pool = require('../db');
const app = express();
app.use(express.json());
app.use('/api/donations', require('../routes/donations'));

describe('Donations API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/donations - should return donations', async () => {
    pool.query.mockResolvedValueOnce([[{ id: 1, amount: '100' }]]);
    const res = await request(app).get('/api/donations');
    expect(res.status).toBe(200);
    expect(res.body[0].amount).toBe('100');
  });

  it('POST /api/donations - should add donation', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 2 }]);
    const res = await request(app).post('/api/donations').send({ amount: '50', donation_type: 'cash' });
    expect(res.status).toBe(201);
  });

  it('GET /api/donations - db error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).get('/api/donations');
    expect(res.status).toBe(500);
  });
}); 