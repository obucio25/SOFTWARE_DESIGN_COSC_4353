const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Generic CRUD endpoints for notifications
router.get('/all', auth, async (req, res) => {
  try {
    const [notifications] = await pool.query('SELECT * FROM notifications');
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/by-id/:id', auth, async (req, res) => {
  try {
    const [notifications] = await pool.query('SELECT * FROM notifications WHERE notifications_id = ?', [req.params.id]);
    if (notifications.length === 0) return res.status(404).json({ message: 'Notification not found' });
    res.json(notifications[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/new', auth, async (req, res) => {
  const { USERS_id, message, type } = req.body;
  if (!USERS_id || !message) return res.status(400).json({ message: 'Missing required fields' });
  try {
    const [result] = await pool.query(
      'INSERT INTO notifications (USERS_id, message, type, created_at) VALUES (?, ?, ?, NOW())',
      [USERS_id, message, type || 'general']
    );
    res.status(201).json({ message: 'Notification created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/by-id/:id', auth, async (req, res) => {
  const { message, type, is_read } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE notifications SET message=?, type=?, is_read=? WHERE notifications_id=?',
      [message, type, is_read, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/by-id/:id', auth, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM notifications WHERE notifications_id=?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get my notifications
router.get('/', auth, async (req, res) => {
  try {
    const [notifications] = await pool.query(`
      SELECT * FROM notifications 
      WHERE USERS_id = ? 
      ORDER BY created_at DESC
    `, [req.user.id_user]);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Mark as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE notifications_id = ? AND USERS_id = ?', [req.params.id, req.user.id_user]);
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Mark all as read (bulk operation)
router.put('/read-all', auth, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE USERS_id = ?', [req.user.id_user]);
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Send notification to user (internal function)
const sendNotification = async (userId, message, type = 'general') => {
  try {
    await pool.query(
      'INSERT INTO notifications (USERS_id, message, type, created_at) VALUES (?, ?, ?, NOW())',
      [userId, message, type]
    );
    return true;
  } catch (err) {
    console.error('Failed to send notification:', err);
    return false;
  }
};

// Send event assignment notification
router.post('/event-assignment', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can send notifications' });
  }
  
  const { userId, eventId, eventTitle } = req.body;
  
  try {
    const message = `You have been assigned to event: ${eventTitle}`;
    const success = await sendNotification(userId, message, 'event_assignment');
    
    if (success) {
      res.json({ message: 'Event assignment notification sent' });
    } else {
      res.status(500).json({ message: 'Failed to send notification' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Send event reminder notifications
router.post('/event-reminder/:eventId', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can send reminders' });
  }
  
  try {
    const eventId = req.params.eventId;
    
    // Get event details
    const [events] = await pool.query('SELECT title, date, time FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const event = events[0];
    
    // Get all volunteers registered for this event
    const [volunteers] = await pool.query(`
      SELECT u.id_user, u.name 
      FROM event_registrations er
      JOIN users u ON er.user_id = u.id_user
      WHERE er.event_id = ?
    `, [eventId]);
    
    // Send reminder to each volunteer
    const sentCount = 0;
    for (const volunteer of volunteers) {
      const message = `Reminder: Event "${event.title}" is tomorrow at ${event.time}. Please arrive 15 minutes early!`;
      await sendNotification(volunteer.id_user, message, 'event_reminder');
      sentCount++;
    }
    
    res.json({ 
      message: 'Event reminders sent successfully', 
      recipients_count: sentCount 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Send event update notifications
router.post('/event-update/:eventId', auth, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can send updates' });
  }
  
  const { updateMessage } = req.body;
  
  try {
    const eventId = req.params.eventId;
    
    // Get event title
    const [events] = await pool.query('SELECT title FROM events WHERE id = ?', [eventId]);
    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    const eventTitle = events[0].title;
    
    // Get all volunteers registered for this event
    const [volunteers] = await pool.query(`
      SELECT u.id_user 
      FROM event_registrations er
      JOIN users u ON er.user_id = u.id_user
      WHERE er.event_id = ?
    `, [eventId]);
    
    // Send update to each volunteer
    const sentCount = 0;
    for (const volunteer of volunteers) {
      const message = `Event Update - "${eventTitle}": ${updateMessage}`;
      await sendNotification(volunteer.id_user, message, 'event_update');
      sentCount++;
    }
    
    res.json({ 
      message: 'Event update notifications sent successfully', 
      recipients_count: sentCount 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get unread notification count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE USERS_id = ? AND is_read = 0',
      [req.user.id_user]
    );
    res.json({ unread_count: result[0].count });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM notifications WHERE notifications_id = ? AND USERS_id = ?',
      [req.params.id, req.user.id_user]
    );
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 