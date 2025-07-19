const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, role, adrees_idadrees_id, adrees_state_state_id } = req.body;
  if (!name || !email || !password || !role || !adrees_idadrees_id || !adrees_state_state_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, adrees_idadrees_id, adrees_state_state_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hash, role, adrees_idadrees_id, adrees_state_state_id]
    );
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id_user: user.id_user, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id_user: user.id_user, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Validation helper
const validateUserData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.length > 50) {
    errors.push('Name is required and must be under 50 characters');
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (data.phone && !/^\d{10}$/.test(data.phone.replace(/\D/g, ''))) {
    errors.push('Phone must be 10 digits');
  }
  
  if (data.skills && !Array.isArray(data.skills)) {
    errors.push('Skills must be an array');
  }
  
  return errors;
};

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.id_user, u.name, u.email, u.role, u.sex, u.date_of_birth, 
             u.Security_question, u.adrees_idadrees_id, u.adrees_state_state_id,
             a.line_1, a.line_2, a.city, s.state
      FROM users u 
      LEFT JOIN adrees a ON u.adrees_idadrees_id = a.idadrees_id 
      LEFT JOIN state s ON a.state_state_id = s.state_id 
      WHERE u.id_user = ?
    `, [req.user.id_user]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user skills (if we had a skills table)
    const [skills] = await pool.query('SELECT * FROM user_skills WHERE user_id = ?', [req.user.id_user]);
    
    const user = users[0];
    user.skills = skills.map(s => s.skill_name);
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user profile (make it better)
router.put('/profile', auth, async (req, res) => {
  const { name, email, phone, skills, preferences, availability } = req.body;
  
  // Validate the data (because we care)
  const errors = validateUserData({ name, email, phone, skills });
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  
  try {
    // Update basic info
    await pool.query(
      'UPDATE users SET name = ?, email = ? WHERE id_user = ?',
      [name, email, req.user.id_user]
    );
    
    // Update skills (if we had a skills table)
    if (skills && Array.isArray(skills)) {
      await pool.query('DELETE FROM user_skills WHERE user_id = ?', [req.user.id_user]);
      for (const skill of skills) {
        await pool.query('INSERT INTO user_skills (user_id, skill_name) VALUES (?, ?)', 
          [req.user.id_user, skill]);
      }
    }
    
    // Update preferences (if we had a preferences table)
    if (preferences) {
      await pool.query(
        'INSERT INTO user_preferences (user_id, preferences) VALUES (?, ?) ON DUPLICATE KEY UPDATE preferences = ?',
        [req.user.id_user, JSON.stringify(preferences), JSON.stringify(preferences)]
      );
    }
    
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get user availability (when can they help?)
router.get('/availability', auth, async (req, res) => {
  try {
    const [availability] = await pool.query(
      'SELECT * FROM user_availability WHERE user_id = ?',
      [req.user.id_user]
    );
    res.json(availability);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update user availability (set your schedule)
router.put('/availability', auth, async (req, res) => {
  const { availability } = req.body;
  
  if (!Array.isArray(availability)) {
    return res.status(400).json({ message: 'Availability must be an array' });
  }
  
  try {
    // Clear existing availability
    await pool.query('DELETE FROM user_availability WHERE user_id = ?', [req.user.id_user]);
    
    // Add new availability
    for (const slot of availability) {
      await pool.query(
        'INSERT INTO user_availability (user_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
        [req.user.id_user, slot.day, slot.start, slot.end]
      );
    }
    
    res.json({ message: 'Availability updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 