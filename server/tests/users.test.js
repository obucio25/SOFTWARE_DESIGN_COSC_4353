jest.mock('../middleware/auth', () => {
  return jest.fn((req, res, next) => {
    req.user = { id_user: 1, role: 'manager' };
    next();
  });
});

const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock the database
jest.mock('../db', () => ({
  query: jest.fn()
}));

const pool = require('../db');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/users', require('../routes/users'));

describe('Users API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'public',
        adrees_idadrees_id: 1,
        adrees_state_state_id: 1
      };

      // Mock bcrypt.hash
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');
      
      // Mock database queries
      pool.query
        .mockResolvedValueOnce([[]]) // No existing user
        .mockResolvedValueOnce([{ insertId: 1 }]); // Insert successful

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should return 400 for missing required fields', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com'
        // Missing password and other required fields
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing required fields');
    });

    it('should return 409 for existing email', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
        role: 'public',
        adrees_idadrees_id: 1,
        adrees_state_state_id: 1
      };

      // Mock existing user
      pool.query.mockResolvedValueOnce([[{ id: 1, email: 'existing@example.com' }]]);

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Email already registered');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id_user: 1,
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        role: 'public'
      };

      // Mock database query
      pool.query.mockResolvedValueOnce([[mockUser]]);
      
      // Mock bcrypt.compare
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      
      // Mock jwt.sign
      jest.spyOn(jwt, 'sign').mockReturnValue('mockToken');

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should return 400 for missing credentials', async () => {
      const loginData = {
        email: 'test@example.com'
        // Missing password
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing email or password');
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Mock no user found
      pool.query.mockResolvedValueOnce([[]]);

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/users/profile', () => {
    it('should return user profile with valid token', async () => {
      const mockUser = {
        id_user: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'public',
        adrees_idadrees_id: 1,
        adrees_state_state_id: 1
      };

      // Mock database query
      pool.query.mockResolvedValueOnce([[mockUser]]);

      // Mock JWT verification
      const mockReq = {
        headers: {
          authorization: 'Bearer mockToken'
        },
        user: { id_user: 1 }
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      // Test the auth middleware
      const auth = require('../middleware/auth');
      const next = jest.fn();

      // Mock jwt.verify
      jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
        callback(null, { id_user: 1 });
      });

      auth(mockReq, mockRes, next);

      expect(next).toHaveBeenCalled();
      expect(mockReq.user).toEqual({ id_user: 1, role: 'manager' });
    });
  });
}); 