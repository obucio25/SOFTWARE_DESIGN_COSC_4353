jest.mock('../middleware/auth', () => {
  return jest.fn((req, res, next) => {
    req.user = { id_user: 1, role: 'manager' };
    next();
  });
});

const request = require('supertest');
const express = require('express');

// Mock the database
jest.mock('../db', () => ({
  query: jest.fn()
}));

const pool = require('../db');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/events', require('../routes/events'));

describe('Events API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/events', () => {
    it('should return all events', async () => {
      const mockEvents = [
        { id: 1, title: 'Adoption Fair', date: '2024-06-01', required_skills: 'dog_handling,public_speaking' },
        { id: 2, title: 'Fundraiser', date: '2024-06-15', required_skills: 'fundraising' }
      ];

      pool.query.mockResolvedValueOnce([mockEvents]);

      const response = await request(app).get('/api/events');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].required_skills).toEqual(['dog_handling', 'public_speaking']);
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return event by ID', async () => {
      const mockEvent = {
        id: 1,
        title: 'Adoption Fair',
        date: '2024-06-01',
        required_skills: 'dog_handling,public_speaking',
        registered_volunteers: 5
      };

      pool.query.mockResolvedValueOnce([[mockEvent]]);

      const response = await request(app).get('/api/events/1');

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Adoption Fair');
      expect(response.body.required_skills).toEqual(['dog_handling', 'public_speaking']);
    });

    it('should return 404 for non-existent event', async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const response = await request(app).get('/api/events/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Event not found');
    });
  });

  describe('POST /api/events', () => {
    it('should create event with valid data', async () => {
      const eventData = {
        title: 'New Event',
        description: 'Event description',
        date: '2024-06-01',
        time: '10:00:00',
        location: 'Community Center',
        urgency: 'medium',
        required_skills: ['dog_handling'],
        max_volunteers: 10
      };

      pool.query
        .mockResolvedValueOnce([{ insertId: 1 }]) // Event insert
        .mockResolvedValueOnce([{ insertId: 1 }]); // Skill insert

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer mockToken')
        .send(eventData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Event created successfully');
    });

    it('should return 400 for invalid data', async () => {
      const eventData = {
        title: '', // Invalid: empty title
        description: 'Event description',
        date: 'invalid-date',
        location: 'Community Center',
        urgency: 'invalid-urgency'
      };

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer mockToken')
        .send(eventData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('PUT /api/events/:id', () => {
    it('should update event with valid data', async () => {
      const eventData = {
        title: 'Updated Event',
        description: 'Updated description',
        date: '2024-06-01',
        time: '10:00:00',
        location: 'Updated Location',
        urgency: 'high',
        required_skills: ['dog_handling', 'first_aid'],
        max_volunteers: 15
      };

      pool.query
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Update event
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Delete skills
        .mockResolvedValueOnce([{ insertId: 1 }]) // Insert skill 1
        .mockResolvedValueOnce([{ insertId: 2 }]); // Insert skill 2

      const response = await request(app)
        .put('/api/events/1')
        .set('Authorization', 'Bearer mockToken')
        .send(eventData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Event updated successfully');
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete event', async () => {
      pool.query
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Delete skills
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // Delete registrations
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // Delete event

      const response = await request(app)
        .delete('/api/events/1')
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Event deleted successfully');
    });
  });

  describe('POST /api/events/:id/register', () => {
    it('should register user for event', async () => {
      // Mock not already registered
      pool.query
        .mockResolvedValueOnce([[]]) // No existing registration
        .mockResolvedValueOnce([[{ max_volunteers: 10, current_volunteers: 5 }]]) // Event capacity check
        .mockResolvedValueOnce([{ insertId: 1 }]); // Registration insert

      const response = await request(app)
        .post('/api/events/1/register')
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Registered for event successfully');
    });

    it('should return 409 if already registered', async () => {
      // Mock already registered
      pool.query.mockResolvedValueOnce([[{ id: 1 }]]); // Existing registration

      const response = await request(app)
        .post('/api/events/1/register')
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Already registered for this event');
    });

    it('should return 400 if event is full', async () => {
      // Mock not registered but event full
      pool.query
        .mockResolvedValueOnce([[]]) // No existing registration
        .mockResolvedValueOnce([[{ max_volunteers: 5, current_volunteers: 5 }]]); // Event full

      const response = await request(app)
        .post('/api/events/1/register')
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Event is full');
    });
  });

  describe('DELETE /api/events/:id/register', () => {
    it('should unregister user from event', async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Delete registration

      const response = await request(app)
        .delete('/api/events/1/register')
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Unregistered from event successfully');
    });
  });
}); 