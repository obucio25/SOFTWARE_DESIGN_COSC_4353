const request = require('supertest');
const express = require('express');
jest.mock('../middleware/auth', () => jest.fn((req, res, next) => { req.user = { id_user: 1, role: 'manager' }; next(); }));
jest.mock('../db', () => ({ query: jest.fn() }));
const pool = require('../db');
const app = express();
app.use(express.json());
app.use('/api/volunteers', require('../routes/volunteers'));

describe('Volunteers API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/volunteers - should return all volunteers', async () => {
    pool.query.mockResolvedValueOnce([[{ id_user: 1, name: 'Test Volunteer' }]]);
    const res = await request(app).get('/api/volunteers');
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe('Test Volunteer');
  });

  it('GET /api/volunteers/1 - should return volunteer by id', async () => {
    pool.query.mockResolvedValueOnce([[{ id_user: 1, name: 'Test Volunteer' }]]);
    const res = await request(app).get('/api/volunteers/1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test Volunteer');
  });

  it('POST /api/volunteers - should create volunteer', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 2 }]);
    const res = await request(app).post('/api/volunteers').send({ name: 'New', email: 'new@x.com', password: 'pw' });
    expect(res.status).toBe(201);
  });

  it('PUT /api/volunteers/1 - should update volunteer', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).put('/api/volunteers/1').send({ name: 'Updated', email: 'u@x.com' });
    expect(res.status).toBe(200);
  });

  it('DELETE /api/volunteers/1 - should delete volunteer', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).delete('/api/volunteers/1');
    expect(res.status).toBe(200);
  });

  it('POST /api/volunteers/apply - should submit application', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 3 }]);
    const res = await request(app).post('/api/volunteers/apply').send({ availability_date: '2024-06-01', skills: 'dog_handling', motivation: 'help', request_date: '2024-05-01', availability_time: '10:00' });
    expect(res.status).toBe(201);
  });
}); 