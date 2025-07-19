const request = require('supertest');
const express = require('express');
jest.mock('../middleware/auth', () => jest.fn((req, res, next) => { req.user = { id_user: 1, role: 'manager' }; next(); }));
jest.mock('../db', () => ({ query: jest.fn() }));
const pool = require('../db');
const app = express();
app.use(express.json());
app.use('/api/notifications', require('../routes/notifications'));

describe('Notifications API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/notifications/all - should return all notifications', async () => {
    pool.query.mockResolvedValueOnce([[{ notifications_id: 1, message: 'Test' }]]);
    const res = await request(app).get('/api/notifications/all');
    expect(res.status).toBe(200);
    expect(res.body[0].message).toBe('Test');
  });

  it('GET /api/notifications/by-id/1 - should return notification by id', async () => {
    pool.query.mockResolvedValueOnce([[{ notifications_id: 1, message: 'Test' }]]);
    const res = await request(app).get('/api/notifications/by-id/1');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Test');
  });

  it('POST /api/notifications/new - should create notification', async () => {
    pool.query.mockResolvedValueOnce([{ insertId: 2 }]);
    const res = await request(app).post('/api/notifications/new').send({ USERS_id: 1, message: 'Hello' });
    expect(res.status).toBe(201);
  });

  it('PUT /api/notifications/by-id/1 - should update notification', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).put('/api/notifications/by-id/1').send({ message: 'Updated', type: 'info', is_read: 1 });
    expect(res.status).toBe(200);
  });

  it('DELETE /api/notifications/by-id/1 - should delete notification', async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).delete('/api/notifications/by-id/1');
    expect(res.status).toBe(200);
  });

  it('GET /api/notifications - should return my notifications', async () => {
    pool.query.mockResolvedValueOnce([[{ notifications_id: 1, message: 'Test' }]]);
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(200);
    expect(res.body[0].message).toBe('Test');
  });
}); 