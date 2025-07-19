const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Validation helper for events
const validateEventData = (data) => {
  const errors = [];
  
  if (!data.title || data.title.length > 100) {
    errors.push('Event title is required and must be under 100 characters');
  }
  
  if (!data.description || data.description.length > 500) {
    errors.push('Event description is required and must be under 500 characters');
  }
  
  if (!data.date || !Date.parse(data.date)) {
    errors.push('Valid event date is required');
  }
  
  if (!data.location || data.location.length > 200) {
    errors.push('Event location is required and must be under 200 characters');
  }
  
  if (!data.urgency || !['low', 'medium', 'high', 'critical'].includes(data.urgency)) {
    errors.push('Urgency must be low, medium, high, or critical');
  }
  
  if (data.required_skills && !Array.isArray(data.required_skills)) {
    errors.push('Required skills must be an array');
  }
  
  return errors;
};

// Get all events (show me what's happening)
router.get('/', async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, 
             GROUP_CONCAT(es.skill_name) as required_skills
      FROM events e
      LEFT JOIN event_skills es ON e.id = es.event_id
      GROUP BY e.id
      ORDER BY e.date ASC
    `);
    
    // Parse skills string back to array
    const eventsWithSkills = events.map(event => ({
      ...event,
      required_skills: event.required_skills ? event.required_skills.split(',') : []
    }));
    
    res.json(eventsWithSkills);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get event by ID (the details)
router.get('/:id', async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, 
             GROUP_CONCAT(es.skill_name) as required_skills,
             COUNT(er.user_id) as registered_volunteers
      FROM events e
      LEFT JOIN event_skills es ON e.id = es.event_id
      LEFT JOIN event_registrations er ON e.id = er.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `, [req.params.id]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const event = events[0];
    event.required_skills = event.required_skills ? event.required_skills.split(',') : [];
    
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create new event (managers only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can create events' });
  }
  
  const { title, description, date, time, location, urgency, required_skills, max_volunteers } = req.body;
  
  // Validate the data
  const errors = validateEventData({ title, description, date, location, urgency, required_skills });
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  try {
    // Insert event
    const [result] = await pool.query(
      'INSERT INTO events (title, description, date, time, location, urgency, max_volunteers, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, date, time, location, urgency, max_volunteers, req.user.id_user]
    );
    
    const eventId = result.insertId;
    
    // Add required skills
    if (required_skills && Array.isArray(required_skills)) {
      for (const skill of required_skills) {
        await pool.query(
          'INSERT INTO event_skills (event_id, skill_name) VALUES (?, ?)',
          [eventId, skill]
        );
      }
    }
    
    res.status(201).json({ 
      message: 'Event created successfully', 
      event_id: eventId 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update event (managers only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can update events' });
  }
  
  const { title, description, date, time, location, urgency, required_skills, max_volunteers } = req.body;
  
  // Validate the data
  const errors = validateEventData({ title, description, date, location, urgency, required_skills });
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  try {
    // Update event
    await pool.query(
      'UPDATE events SET title = ?, description = ?, date = ?, time = ?, location = ?, urgency = ?, max_volunteers = ? WHERE id = ?',
      [title, description, date, time, location, urgency, max_volunteers, req.params.id]
    );
    
    // Update required skills
    if (required_skills && Array.isArray(required_skills)) {
      await pool.query('DELETE FROM event_skills WHERE event_id = ?', [req.params.id]);
      for (const skill of required_skills) {
        await pool.query(
          'INSERT INTO event_skills (event_id, skill_name) VALUES (?, ?)',
          [req.params.id, skill]
        );
      }
    }
    
    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete event (managers only)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can delete events' });
  }
  
  try {
    await pool.query('DELETE FROM event_skills WHERE event_id = ?', [req.params.id]);
    await pool.query('DELETE FROM event_registrations WHERE event_id = ?', [req.params.id]);
    await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Register for event (bring your own snacks)
router.post('/:id/register', auth, async (req, res) => {
  try {
    // Check if already registered
    const [existing] = await pool.query(
      'SELECT * FROM event_registrations WHERE event_id = ? AND user_id = ?',
      [req.params.id, req.user.id_user]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Already registered for this event' });
    }
    
    // Check if event is full
    const [event] = await pool.query(
      'SELECT max_volunteers, (SELECT COUNT(*) FROM event_registrations WHERE event_id = ?) as current_volunteers FROM events WHERE id = ?',
      [req.params.id, req.params.id]
    );
    
    if (event[0].current_volunteers >= event[0].max_volunteers) {
      return res.status(400).json({ message: 'Event is full' });
    }
    
    // Register for event
    await pool.query(
      'INSERT INTO event_registrations (event_id, user_id, registration_date) VALUES (?, ?, NOW())',
      [req.params.id, req.user.id_user]
    );
    
    res.json({ message: 'Registered for event successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Unregister from event (no hard feelings)
router.delete('/:id/register', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM event_registrations WHERE event_id = ? AND user_id = ?',
      [req.params.id, req.user.id_user]
    );
    
    res.json({ message: 'Unregistered from event successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 