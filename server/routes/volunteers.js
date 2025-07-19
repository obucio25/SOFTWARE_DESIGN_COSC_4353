const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Generic CRUD endpoints for volunteers
router.get('/', auth, async (req, res) => {
  try {
    const [volunteers] = await pool.query('SELECT * FROM users WHERE role = ?', ['volunteer']);
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const [volunteers] = await pool.query('SELECT * FROM users WHERE id_user = ? AND role = ?', [req.params.id, 'volunteer']);
    if (volunteers.length === 0) return res.status(404).json({ message: 'Volunteer not found' });
    res.json(volunteers[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { name, email, password, adrees_idadrees_id, adrees_state_state_id } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing required fields' });
  try {
    // Hash password (in real app, use bcrypt)
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, adrees_idadrees_id, adrees_state_state_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, 'volunteer', adrees_idadrees_id, adrees_state_state_id]
    );
    res.status(201).json({ message: 'Volunteer created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { name, email, adrees_idadrees_id, adrees_state_state_id } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE users SET name=?, email=?, adrees_idadrees_id=?, adrees_state_state_id=? WHERE id_user=? AND role=?',
      [name, email, adrees_idadrees_id, adrees_state_state_id, req.params.id, 'volunteer']
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Volunteer not found' });
    res.json({ message: 'Volunteer updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id_user=? AND role=?', [req.params.id, 'volunteer']);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Volunteer not found' });
    res.json({ message: 'Volunteer deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Apply to volunteer
router.post('/apply', auth, async (req, res) => {
  const { availability_date, skills, motivation, request_date, availability_time } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO volunteer_requests (availability_date, skills, motivation, request_date, status, availability_time, USERS_id_user) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [availability_date, skills, motivation, request_date, 'pending', availability_time, req.user.id_user]
    );
    res.status(201).json({ message: 'Volunteer application submitted', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Assign a task 
router.post('/tasks', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ message: 'Forbidden' });
  const { task_name, description, task_date, status, USERS_id_user } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO volunteer_tasks (task_name, description, task_date, status, USERS_id_user) VALUES (?, ?, ?, ?, ?)',
      [task_name, description, task_date, status, USERS_id_user]
    );
    res.status(201).json({ message: 'Task assigned', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// My tasks 
router.get('/tasks/my', auth, async (req, res) => {
  try {
    const [tasks] = await pool.query('SELECT * FROM volunteer_tasks WHERE USERS_id_user = ?', [req.user.id_user]);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// All volunteer applications
router.get('/applications', auth, async (req, res) => {
  if (req.user.role !== 'manager') return res.status(403).json({ message: 'Forbidden' });
  try {
    const [apps] = await pool.query('SELECT * FROM volunteer_requests');
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Match volunteers to events
router.get('/match/:eventId', auth, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    // Get event details and required skills
    const [events] = await pool.query(`
      SELECT e.*, GROUP_CONCAT(es.skill_name) as required_skills
      FROM events e
      LEFT JOIN event_skills es ON e.id = es.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `, [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const event = events[0];
    const requiredSkills = event.required_skills ? event.required_skills.split(',') : [];
    
    // Find volunteers with matching skills
    let volunteersQuery = `
      SELECT DISTINCT u.id_user, u.name, u.email,
             GROUP_CONCAT(us.skill_name) as user_skills,
             COUNT(DISTINCT us.skill_name) as matching_skills
      FROM users u
      LEFT JOIN user_skills us ON u.id_user = us.user_id
      WHERE u.role = 'volunteer' 
        AND us.skill_name IN (?)
      GROUP BY u.id_user
      HAVING matching_skills > 0
      ORDER BY matching_skills DESC
    `;
    
    const [volunteers] = await pool.query(volunteersQuery, [requiredSkills]);
    
    // Check availability for each volunteer
    const volunteersWithAvailability = [];
    for (const volunteer of volunteers) {
      const [availability] = await pool.query(`
        SELECT * FROM user_availability 
        WHERE user_id = ? 
          AND day_of_week = DAYOFWEEK(?)
          AND start_time <= ? 
          AND end_time >= ?
      `, [volunteer.id_user, event.date, event.time, event.time]);
      
      if (availability.length > 0) {
        volunteer.available = true;
        volunteer.availability = availability[0];
      } else {
        volunteer.available = false;
      }
      
      volunteersWithAvailability.push(volunteer);
    }
    
    // Filter to only available volunteers and sort by match quality
    const matchedVolunteers = volunteersWithAvailability
      .filter(v => v.available)
      .map(v => ({
        ...v,
        user_skills: v.user_skills ? v.user_skills.split(',') : [],
        match_percentage: Math.round((v.matching_skills / requiredSkills.length) * 100)
      }))
      .sort((a, b) => b.match_percentage - a.match_percentage);
    
    res.json({
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        required_skills: requiredSkills
      },
      matched_volunteers: matchedVolunteers,
      total_matches: matchedVolunteers.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Auto-assign volunteers to event (managers only)
router.post('/assign/:eventId', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can assign volunteers' });
  }
  
  try {
    const eventId = req.params.eventId;
    const { volunteerIds } = req.body;
    
    if (!Array.isArray(volunteerIds)) {
      return res.status(400).json({ message: 'Volunteer IDs must be an array' });
    }
    
    // Check event capacity
    const [event] = await pool.query(
      'SELECT max_volunteers, (SELECT COUNT(*) FROM event_registrations WHERE event_id = ?) as current_volunteers FROM events WHERE id = ?',
      [eventId, eventId]
    );
    
    if (event[0].current_volunteers + volunteerIds.length > event[0].max_volunteers) {
      return res.status(400).json({ message: 'Too many volunteers for this event' });
    }
    
    // Assign volunteers
    const assignments = [];
    for (const volunteerId of volunteerIds) {
      await pool.query(
        'INSERT INTO event_registrations (event_id, user_id, registration_date, assigned_by) VALUES (?, ?, NOW(), ?)',
        [eventId, volunteerId, req.user.id_user]
      );
      
      // Create notification for volunteer
      await pool.query(
        'INSERT INTO notifications (USERS_id, message, type, created_at) VALUES (?, ?, ?, NOW())',
        [volunteerId, `You have been assigned to event ${eventId}`, 'event_assignment']
      );
      
      assignments.push(volunteerId);
    }
    
    res.json({ 
      message: 'Volunteers assigned successfully', 
      assigned_count: assignments.length,
      assigned_volunteers: assignments
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get volunteer recommendations for an event
router.get('/recommendations/:eventId', auth, async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    // Get event requirements
    const [events] = await pool.query(`
      SELECT e.*, GROUP_CONCAT(es.skill_name) as required_skills
      FROM events e
      LEFT JOIN event_skills es ON e.id = es.event_id
      WHERE e.id = ?
      GROUP BY e.id
    `, [eventId]);
    
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const event = events[0];
    const requiredSkills = event.required_skills ? event.required_skills.split(',') : [];
    
    // Get all volunteers with their skills and availability
    const [volunteers] = await pool.query(`
      SELECT u.id_user, u.name, u.email,
             GROUP_CONCAT(DISTINCT us.skill_name) as skills,
             GROUP_CONCAT(DISTINCT ua.day_of_week) as available_days
      FROM users u
      LEFT JOIN user_skills us ON u.id_user = us.user_id
      LEFT JOIN user_availability ua ON u.id_user = ua.user_id
      WHERE u.role = 'volunteer'
      GROUP BY u.id_user
    `);
    
    // Calculate match scores
    const recommendations = volunteers.map(volunteer => {
      const volunteerSkills = volunteer.skills ? volunteer.skills.split(',') : [];
      const availableDays = volunteer.available_days ? volunteer.available_days.split(',').map(Number) : [];
      
      // Calculate skill match
      const matchingSkills = volunteerSkills.filter(skill => requiredSkills.includes(skill));
      const skillMatchPercentage = requiredSkills.length > 0 ? 
        (matchingSkills.length / requiredSkills.length) * 100 : 0;
      
      // Calculate availability match
      const eventDay = new Date(event.date).getDay();
      const available = availableDays.includes(eventDay);
      
      // Calculate overall score
      const overallScore = skillMatchPercentage * 0.7 + (available ? 30 : 0);
      
      return {
        id_user: volunteer.id_user,
        name: volunteer.name,
        email: volunteer.email,
        skills: volunteerSkills,
        available_days: availableDays,
        matching_skills: matchingSkills,
        skill_match_percentage: Math.round(skillMatchPercentage),
        available_for_event: available,
        overall_score: Math.round(overallScore)
      };
    }).filter(v => v.overall_score > 0)
      .sort((a, b) => b.overall_score - a.overall_score);
    
    res.json({
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        required_skills: requiredSkills
      },
      recommendations: recommendations.slice(0, 10) // Top 10 recommendations
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get volunteer participation history
router.get('/history/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user is requesting their own history or is a manager
    if (req.user.id_user != userId && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized to view this history' });
    }
    
    // Get all events the volunteer has participated in
    const [history] = await pool.query(`
      SELECT e.id, e.title, e.description, e.date, e.time, e.location, e.urgency,
             er.registration_date, er.assigned_by,
             u.name as assigned_by_name,
             COUNT(DISTINCT er2.user_id) as total_volunteers,
             e.max_volunteers
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      LEFT JOIN users u ON er.assigned_by = u.id_user
      LEFT JOIN event_registrations er2 ON e.id = er2.event_id
      WHERE er.user_id = ?
      GROUP BY e.id, er.registration_date
      ORDER BY e.date DESC
    `, [userId]);
    
    // Calculate participation stats
    const totalEvents = history.length;
    const totalHours = history.reduce((sum, event) => {
      // Estimate hours based on event duration (you might want to add actual duration field)
      return sum + 3; // Assuming average 3 hours per event
    }, 0);
    
    const eventTypes = [...new Set(history.map(event => event.urgency))];
    
    res.json({
      volunteer_id: userId,
      total_events: totalEvents,
      total_hours: totalHours,
      event_types: eventTypes,
      participation_history: history
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get volunteer performance metrics (managers only)
router.get('/performance/:userId', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can view performance metrics' });
  }
  
  try {
    const userId = req.params.userId;
    
    // Get volunteer's event participation
    const [events] = await pool.query(`
      SELECT e.id, e.title, e.date, e.urgency,
             er.registration_date,
             CASE WHEN er.assigned_by IS NOT NULL THEN 'Assigned' ELSE 'Self-Registered' END as registration_type
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      WHERE er.user_id = ?
      ORDER BY e.date DESC
    `, [userId]);
    
    // Get volunteer's skills
    const [skills] = await pool.query(`
      SELECT skill_name, proficiency_level
      FROM user_skills
      WHERE user_id = ?
    `, [userId]);
    
    // Calculate metrics
    const totalEvents = events.length;
    const assignedEvents = events.filter(e => e.registration_type === 'Assigned').length;
    const selfRegisteredEvents = events.filter(e => e.registration_type === 'Self-Registered').length;
    
    const urgencyBreakdown = events.reduce((acc, event) => {
      acc[event.urgency] = (acc[event.urgency] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate reliability score (events attended vs assigned)
    const reliabilityScore = totalEvents > 0 ? Math.round((assignedEvents / totalEvents) * 100) : 0;
    
    res.json({
      volunteer_id: userId,
      total_events: totalEvents,
      assigned_events: assignedEvents,
      self_registered_events: selfRegisteredEvents,
      reliability_score: reliabilityScore,
      urgency_breakdown: urgencyBreakdown,
      skills: skills,
      recent_events: events.slice(0, 5) // Last 5 events
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all volunteer statistics (manager dashboard)
router.get('/statistics', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can view statistics' });
  }
  
  try {
    // Get total volunteers
    const [volunteerCount] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = "volunteer"'
    );
    
    // Get active volunteers (participated in last 30 days)
    const [activeVolunteers] = await pool.query(`
      SELECT COUNT(DISTINCT er.user_id) as count
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      WHERE e.date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    // Get total events this month
    const [monthlyEvents] = await pool.query(`
      SELECT COUNT(*) as count
      FROM events
      WHERE date >= DATE_FORMAT(NOW(), '%Y-%m-01')
    `);
    
    // Get top performing volunteers
    const [topVolunteers] = await pool.query(`
      SELECT u.id_user, u.name, u.email,
             COUNT(er.event_id) as events_attended,
             COUNT(CASE WHEN er.assigned_by IS NOT NULL THEN 1 END) as assigned_events
      FROM users u
      LEFT JOIN event_registrations er ON u.id_user = er.user_id
      LEFT JOIN events e ON er.event_id = e.id
      WHERE u.role = 'volunteer'
        AND e.date >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      GROUP BY u.id_user
      ORDER BY events_attended DESC
      LIMIT 10
    `);
    
    res.json({
      total_volunteers: volunteerCount[0].count,
      active_volunteers: activeVolunteers[0].count,
      monthly_events: monthlyEvents[0].count,
      top_performers: topVolunteers
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Export volunteer history to CSV (manager only)
router.get('/export-history/:userId', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can export history' });
  }
  
  try {
    const userId = req.params.userId;
    
    const [history] = await pool.query(`
      SELECT e.title, e.date, e.time, e.location, e.urgency,
             er.registration_date,
             CASE WHEN er.assigned_by IS NOT NULL THEN 'Assigned' ELSE 'Self-Registered' END as registration_type
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      WHERE er.user_id = ?
      ORDER BY e.date DESC
    `, [userId]);
    
    // Convert to CSV format
    const csvHeaders = 'Event Title,Date,Time,Location,Urgency,Registration Date,Registration Type\n';
    const csvData = history.map(event => 
      `"${event.title}","${event.date}","${event.time}","${event.location}","${event.urgency}","${event.registration_date}","${event.registration_type}"`
    ).join('\n');
    
    const csvContent = csvHeaders + csvData;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="volunteer_history_${userId}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 