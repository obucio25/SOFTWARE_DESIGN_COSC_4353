const request = require('supertest');
const express = require('express');
jest.mock('../middleware/auth', () => jest.fn((req, res, next) => { req.user = { id_user: 1, role: 'manager' }; next(); }));
jest.mock('../db', () => ({ query: jest.fn() }));
const pool = require('../db');
const app = express();
app.use(express.json());
app.use('/api/animals', require('../routes/animals'));

describe('Animals API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/animals - should return animals', async () => {
    pool.query.mockResolvedValueOnce([[{ id_animal: 1, name: 'Buddy' }]]);
    const res = await request(app).get('/api/animals');
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('Buddy');
  });

  it('POST /api/animals - should add animal', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 2 }]);
    const res = await request(app).post('/api/animals').send({ name: 'Max', species: 'Dog', age: 2 });
    expect(res.status).toBe(201);
  });

  it('PUT /api/animals/:id - should update animal', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).put('/api/animals/1').send({ name: 'Maximus' });
    expect(res.status).toBe(200);
  });

  it('DELETE /api/animals/:id - should delete animal', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).delete('/api/animals/1');
    expect(res.status).toBe(200);
  });

  it('GET /api/animals - db error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app).get('/api/animals');
    expect(res.status).toBe(500);
  });
}); 